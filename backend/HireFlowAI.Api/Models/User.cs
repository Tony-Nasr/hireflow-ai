using Microsoft.AspNetCore.Identity;

namespace HireFlowAI.Api.Models
{
    public enum UserRole
    {
        Admin,
        HR,
        Candidate
    }

    public class User : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public Company? Company { get; set; }
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
}