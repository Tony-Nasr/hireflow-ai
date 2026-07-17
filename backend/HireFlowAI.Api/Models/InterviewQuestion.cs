namespace HireFlowAI.Api.Models
{
    public class InterviewQuestion
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public bool GeneratedByAI { get; set; } = true;

        public int ApplicationId { get; set; }
        public Application Application { get; set; } = null!;
    }
}