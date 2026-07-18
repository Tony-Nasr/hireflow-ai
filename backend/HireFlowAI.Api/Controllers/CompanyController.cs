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
    [Authorize(Roles = "HR")]
    public class CompanyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("me")]
        public async Task<IActionResult> GetMyCompany()
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "No company profile yet." });

            return Ok(new CompanyResponseDto
            {
                Id = company.Id,
                Name = company.Name,
                Industry = company.Industry,
                Description = company.Description
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany(CreateCompanyDto dto)
        {
            var existing = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (existing != null)
                return BadRequest(new { message = "Company profile already exists." });

            var company = new Company
            {
                Name = dto.Name,
                Industry = dto.Industry,
                Description = dto.Description,
                UserId = CurrentUserId
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return Ok(new CompanyResponseDto
            {
                Id = company.Id,
                Name = company.Name,
                Industry = company.Industry,
                Description = company.Description
            });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyCompany(CreateCompanyDto dto)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

            if (company == null)
                return NotFound(new { message = "No company profile yet." });

            company.Name = dto.Name;
            company.Industry = dto.Industry;
            company.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new CompanyResponseDto
            {
                Id = company.Id,
                Name = company.Name,
                Industry = company.Industry,
                Description = company.Description
            });
        }
    }
}