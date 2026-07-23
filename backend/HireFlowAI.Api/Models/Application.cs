namespace HireFlowAI.Api.Models
{
    /*public enum ApplicationStage
    {
        Applied,
        Screened,
        Interview,
        Offer,
        Hired,
        Rejected
    }*/

    public enum ApplicationStatus
{
    Applied = 0,
    Reviewed = 1,
    Interview = 2,
    Hired = 3,
    Rejected = 4
}

    public class Application
    {
        public int Id { get; set; }
        public string CvUrl { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public int? AiScore { get; set; }
        public string? AiFeedback { get; set; }
        public ApplicationStage Stage { get; set; } = ApplicationStage.Applied;
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public int JobId { get; set; }
        public Job Job { get; set; } = null!;

        public string CandidateId { get; set; } = string.Empty;
        public User Candidate { get; set; } = null!;

        public ICollection<InterviewQuestion> InterviewQuestions { get; set; } = new List<InterviewQuestion>();
    }
}