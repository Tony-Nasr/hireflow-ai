namespace HireFlowAI.Api.DTOs
{
    public class CreateCompanyDto
    {
        public string Name { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CompanyResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}