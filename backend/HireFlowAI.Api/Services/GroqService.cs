using System.Text;
using System.Text.Json;

namespace HireFlowAI.Api.Services
{
    public class GroqService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GroqService(IConfiguration config, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = config["Groq:ApiKey"]!;
        }

        public async Task<(int Score, string Feedback)> ScoreCvAsync(string cvText, string jobTitle, string jobDescription, string requirements)
        {
            var prompt = "You are an expert HR recruiter. Analyze this CV against the job requirements.\n\n" +
                "JOB TITLE: " + jobTitle + "\n" +
                "JOB DESCRIPTION: " + jobDescription + "\n" +
                "REQUIREMENTS: " + requirements + "\n\n" +
                "CV TEXT:\n" + cvText + "\n\n" +
                "Respond ONLY with a JSON object in this exact format, no other text:\n" +
                "{\"score\": 85, \"feedback\": \"Your explanation here in 2-3 sentences.\"}\n\n" +
                "Score rules: 0-40 poor match, 41-60 partial match, 61-80 good match, 81-100 excellent match.";

            var response = await CallGroqAsync(prompt);

            try
            {
                var clean = response.Trim();
                if (clean.Contains("```"))
                {
                    var start = clean.IndexOf('{');
                    var end = clean.LastIndexOf('}');
                    if (start >= 0 && end >= 0)
                        clean = clean.Substring(start, end - start + 1);
                }

                var result = JsonSerializer.Deserialize<JsonElement>(clean);
                var score = result.GetProperty("score").GetInt32();
                var feedback = result.GetProperty("feedback").GetString() ?? "No feedback available.";
                return (score, feedback);
            }
            catch
            {
                return (50, "AI scoring completed. Manual review recommended.");
            }
        }

        public async Task<List<string>> GenerateInterviewQuestionsAsync(string cvText, string jobTitle, string requirements)
        {
            var prompt = "You are an expert interviewer. Generate 8 specific interview questions.\n\n" +
                "JOB TITLE: " + jobTitle + "\n" +
                "REQUIREMENTS: " + requirements + "\n\n" +
                "CANDIDATE CV:\n" + cvText + "\n\n" +
                "Respond ONLY with a JSON array of strings, no other text:\n" +
                "[\"Question 1?\", \"Question 2?\", \"Question 3?\"]\n\n" +
                "Mix technical and behavioral questions specific to this role.";

            var response = await CallGroqAsync(prompt);

            try
            {
                var clean = response.Trim();
                if (clean.Contains("```"))
                {
                    var start = clean.IndexOf('[');
                    var end = clean.LastIndexOf(']');
                    if (start >= 0 && end >= 0)
                        clean = clean.Substring(start, end - start + 1);
                }

                var questions = JsonSerializer.Deserialize<List<string>>(clean);
                return questions ?? new List<string>();
            }
            catch
            {
                return new List<string> { "Tell me about your experience relevant to this position." };
            }
        }

        private async Task<string> CallGroqAsync(string prompt)
{
    var requestBody = new
    {
model = "llama-3.1-8b-instant",        messages = new[]
        {
            new { role = "user", content = prompt }
        },
        temperature = 0.3,
        max_tokens = 1000
    };

    var json = JsonSerializer.Serialize(requestBody);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    _httpClient.DefaultRequestHeaders.Clear();
    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

    var response = await _httpClient.PostAsync(
        "https://api.groq.com/openai/v1/chat/completions", content);
    var responseString = await response.Content.ReadAsStringAsync();

    // Log the full response so we can see what Groq actually returned
    Console.WriteLine($"Groq response status: {response.StatusCode}");
    Console.WriteLine($"Groq response body: {responseString}");

    if (!response.IsSuccessStatusCode)
        throw new Exception($"Groq API error {response.StatusCode}: {responseString}");

    var parsed = JsonSerializer.Deserialize<JsonElement>(responseString);
    return parsed
        .GetProperty("choices")[0]
        .GetProperty("message")
        .GetProperty("content")
        .GetString() ?? "";
}
    }
}