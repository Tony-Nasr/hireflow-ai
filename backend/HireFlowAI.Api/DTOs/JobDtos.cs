namespace HireFlowAI.Api.DTOs
{
    public class CreateJobDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public DateTime Deadline { get; set; }
    }

    public class JobResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public DateTime Deadline { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public int CompanyId { get; set; }
    }
}