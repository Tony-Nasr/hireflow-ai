using HireFlowAI.Api.Models;

namespace HireFlowAI.Api.DTOs
{
    public class ApplicationResponseDto
    {
        public int Id { get; set; }
        public string CvUrl { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public int? AiScore { get; set; }
        public string? AiFeedback { get; set; }
        public string Stage { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
    }

    public class UpdateStageDto
    {
        public ApplicationStage Stage { get; set; }
    }
}