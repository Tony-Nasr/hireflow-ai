import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/client";

type Application = {
  id: number;
  cvUrl: string;
  coverLetter: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
  stage: string; // comes back as a string from ApplicationResponseDto (Stage.ToString())
  appliedAt: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
};

// Order must match Models/ApplicationStage.cs exactly (0-4)
const STAGES = ["Applied", "Reviewed", "Interview", "Hired", "Rejected"];

export default function HRDashboard({ jobId }: { jobId: number }) {
  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery<Application[]>({
    queryKey: ["applications", jobId],
    queryFn: async () => {
      const res = await axios.get(`/Application/job/${jobId}`);
      return res.data;
    },
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stageIndex }: { id: number; stageIndex: number }) =>
      axios.patch(`/Application/${id}/stage`, { stage: stageIndex }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", jobId] });
    },
  });

  if (isLoading) return <p className="p-6">Loading applications...</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load applications.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Candidates — ranked by AI score</h1>

      <div className="grid grid-cols-5 gap-4">
        {STAGES.map((stageName) => (
          <div key={stageName} className="bg-gray-50 rounded-lg p-3">
            <h2 className="font-semibold mb-3">{stageName}</h2>

            {applications
              ?.filter((a) => a.stage === stageName)
              .map((app) => (
                <div key={app.id} className="bg-white rounded-md shadow p-3 mb-3 border">
                  <p className="font-medium">{app.candidateName}</p>
                  <p className="text-sm text-gray-500">{app.candidateEmail}</p>

                  {app.aiScore !== null && (
                    <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                      AI Score: {app.aiScore}/100
                    </span>
                  )}

                  {app.aiFeedback && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                      {app.aiFeedback}
                    </p>
                  )}

                  <a
                    {app.cvUrl && !app.cvUrl.includes("/uploads/") && (
  
    href={app.cvUrl}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-blue-600 underline block mt-2"
  >
    View CV
  </a>
)}

                  <select
                    className="mt-2 w-full text-xs border rounded p-1"
                    value={STAGES.indexOf(app.stage)}
                    onChange={(e) =>
                      updateStage.mutate({
                        id: app.id,
                        stageIndex: Number(e.target.value),
                      })
                    }
                  >
                    {STAGES.map((s, i) => (
                      <option key={s} value={i}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}