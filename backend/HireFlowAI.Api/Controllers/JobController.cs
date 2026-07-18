using System.Security.Claims;
using HireFlowAI.Api.Data;
using HireFlowAI.Api.DTOs;
using HireFlowAI.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireFlowAI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JobController(AppDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET all active jobs — public, no auth needed (candidates browse this)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _context.Jobs
                .Include(j => j.Company)
                .Where(j => j.IsActive)
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new JobResponseDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Requirements = j.Requirements,
                    Salary = j.Salary,
                    Deadline = j.Deadline,
                    IsActive = j.IsActive,
                    CreatedAt = j.CreatedAt,
                    CompanyName = j.Company.Name,
                    CompanyId = j.CompanyId
                })
                .ToListAsync();

            return Ok(jobs);
        }

        // GET single job by id — public
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetJob(int id)
        {
            var job = await _context.Jobs
                .Include(j => j.Company)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound(new { message = "Job not found." });

            return Ok(new JobResponseDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Salary = job.Salary,
                Deadline = job.Deadline,
                IsActive = job.IsActive,
                CreatedAt = job.CreatedAt,
                CompanyName = job.Company.Name,
                CompanyId = job.CompanyId
            });
        }

        // GET jobs posted by this HR's company
        [HttpGet("my-jobs")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> GetMyJobs()
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "Create a company profile first." });

            var jobs = await _context.Jobs
                .Where(j => j.CompanyId == company.Id)
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new JobResponseDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Requirements = j.Requirements,
                    Salary = j.Salary,
                    Deadline = j.Deadline,
                    IsActive = j.IsActive,
                    CreatedAt = j.CreatedAt,
                    CompanyName = company.Name,
                    CompanyId = company.Id
                })
                .ToListAsync();

            return Ok(jobs);
        }

        // POST create a new job — HR only
        [HttpPost]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> CreateJob(CreateJobDto dto)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return BadRequest(new { message = "Create a company profile first." });

            var job = new Job
            {
                Title = dto.Title,
                Description = dto.Description,
                Requirements = dto.Requirements,
                Salary = dto.Salary,
                Deadline = dto.Deadline,
                CompanyId = company.Id
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return Ok(new JobResponseDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Salary = job.Salary,
                Deadline = job.Deadline,
                IsActive = job.IsActive,
                CreatedAt = job.CreatedAt,
                CompanyName = company.Name,
                CompanyId = company.Id
            });
        }

        // PUT update a job — HR only, must own the job
        [HttpPut("{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> UpdateJob(int id, CreateJobDto dto)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "Company not found." });

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == id && j.CompanyId == company.Id);

            if (job == null)
                return NotFound(new { message = "Job not found or not yours." });

            job.Title = dto.Title;
            job.Description = dto.Description;
            job.Requirements = dto.Requirements;
            job.Salary = dto.Salary;
            job.Deadline = dto.Deadline;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Job updated successfully." });
        }

        // DELETE a job — HR only, must own it
        [HttpDelete("{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "Company not found." });

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == id && j.CompanyId == company.Id);

            if (job == null)
                return NotFound(new { message = "Job not found or not yours." });

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Job deleted successfully." });
        }

        // PATCH toggle active/inactive — HR only
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> ToggleJobActive(int id)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound();

            var job = await _context.Jobs
                .FirstOrDefaultAsync(j => j.Id == id && j.CompanyId == company.Id);

            if (job == null)
                return NotFound(new { message = "Job not found or not yours." });

            job.IsActive = !job.IsActive;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Job is now {(job.IsActive ? "active" : "inactive")}." });
        }
    }
}