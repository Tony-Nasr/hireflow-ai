using System.Security.Claims;
using HireFlowAI.Api.Data;
using HireFlowAI.Api.DTOs;
using HireFlowAI.Api.Models;
using HireFlowAI.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireFlowAI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FileStorageService _fileStorage;
        private readonly GroqService _groqService;
        private readonly IServiceScopeFactory _scopeFactory;

        public ApplicationController(
            AppDbContext context,
            FileStorageService fileStorage,
            GroqService groqService,
            IServiceScopeFactory scopeFactory)
        {
            _context = context;
            _fileStorage = fileStorage;
            _groqService = groqService;
            _scopeFactory = scopeFactory;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpPost("apply/{jobId}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Apply(int jobId, [FromForm] IFormFile cv, [FromForm] string? coverLetter)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null || !job.IsActive)
                return NotFound(new { message = "Job not found or no longer active." });

            var alreadyApplied = await _context.Applications
                .AnyAsync(a => a.JobId == jobId && a.CandidateId == CurrentUserId);
            if (alreadyApplied)
                return BadRequest(new { message = "You already applied to this job." });

            if (cv == null || cv.Length == 0)
                return BadRequest(new { message = "Please upload your CV." });

            var cvUrl = await _fileStorage.UploadCvAsync(cv);
            var cvText = await ReadFileTextAsync(cv);

            var application = new Application
            {
                JobId = jobId,
                CandidateId = CurrentUserId,
                CvUrl = cvUrl,
                CoverLetter = coverLetter
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            var applicationId = application.Id;
            var jobTitle = job.Title;
            var jobDescription = job.Description;
            var jobRequirements = job.Requirements;

            _ = Task.Run(async () =>
            {
                try
                {
                    var (score, feedback) = await _groqService.ScoreCvAsync(
                        cvText, jobTitle, jobDescription, jobRequirements);

                    // Create a NEW scope with its own DbContext
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    var app = await db.Applications.FindAsync(applicationId);
                    if (app != null)
                    {
                        app.AiScore = score;
                        app.AiFeedback = feedback;
                        await db.SaveChangesAsync();
                        Console.WriteLine($"AI scoring complete: {score}/100 for application {applicationId}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"AI scoring failed: {ex.Message}");
                }
            });

            return Ok(new { message = "Application submitted successfully.", applicationId });
        }

        [HttpGet("my-applications")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyApplications()
        {
            var applications = await _context.Applications
                .Include(a => a.Job)
                .ThenInclude(j => j.Company)
                .Where(a => a.CandidateId == CurrentUserId)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    CvUrl = a.CvUrl,
                    CoverLetter = a.CoverLetter,
                    AiScore = a.AiScore,
                    AiFeedback = a.AiFeedback,
                    Stage = a.Stage.ToString(),
                    AppliedAt = a.AppliedAt,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    CompanyName = a.Job.Company.Name
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpGet("job/{jobId}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> GetApplicationsForJob(int jobId)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "Company not found." });

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == company.Id);

            if (job == null)
                return NotFound(new { message = "Job not found or not yours." });

            var applications = await _context.Applications
                .Include(a => a.Candidate)
                .Where(a => a.JobId == jobId)
                .OrderByDescending(a => a.AiScore)
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    CvUrl = a.CvUrl,
                    CoverLetter = a.CoverLetter,
                    AiScore = a.AiScore,
                    AiFeedback = a.AiFeedback,
                    Stage = a.Stage.ToString(),
                    AppliedAt = a.AppliedAt,
                    CandidateName = a.Candidate.FullName,
                    CandidateEmail = a.Candidate.Email ?? string.Empty,
                    JobId = a.JobId,
                    JobTitle = job.Title,
                    CompanyName = company.Name
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpPatch("{id}/stage")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> UpdateStage(int id, UpdateStageDto dto)
        {
            var application = await _context.Applications
                .Include(a => a.Job)
                .ThenInclude(j => j.Company)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound(new { message = "Application not found." });

            if (application.Job.Company.UserId != CurrentUserId)
                return Forbid();

            application.Stage = dto.Stage;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Stage updated to {dto.Stage}." });
        }

        [HttpPost("{id}/generate-questions")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> GenerateInterviewQuestions(int id)
        {
            var application = await _context.Applications
                .Include(a => a.Job)
                .ThenInclude(j => j.Company)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound(new { message = "Application not found." });

            if (application.Job.Company.UserId != CurrentUserId)
                return Forbid();

            var questions = await _groqService.GenerateInterviewQuestionsAsync(
                "Experienced .NET and React developer with 3 years experience.",
                application.Job.Title,
                application.Job.Requirements
            );

            var interviewQuestions = questions.Select(q => new InterviewQuestion
            {
                ApplicationId = application.Id,
                Question = q,
                GeneratedByAI = true
            }).ToList();

            _context.InterviewQuestions.AddRange(interviewQuestions);
            await _context.SaveChangesAsync();

            return Ok(new { questions });
        }

        private async Task<string> ReadFileTextAsync(IFormFile file)
        {
            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var text = await reader.ReadToEndAsync();
                return text.Length > 3000 ? text.Substring(0, 3000) : text;
            }
            catch
            {
                return "CV text could not be extracted.";
            }
        }
    }
}