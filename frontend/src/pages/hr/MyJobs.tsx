import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "../../api/client";

type Job = {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary: number | null;
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  companyName: string;
};

export default function MyJobs() {
  const navigate = useNavigate();

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ["my-jobs"],
    queryFn: async () => {
      const res = await axios.get("/Job/my-jobs");
      return res.data;
    },
  });

  if (isLoading) return <p className="p-6">Loading your job postings...</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load job postings.</p>;

  if (!jobs || jobs.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Job Postings</h1>
        <p className="text-gray-500">You haven't posted any jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Job Postings</h1>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border rounded-lg p-4 flex items-center justify-between bg-white shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{job.title}</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    job.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {job.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-gray-500">{job.companyName}</p>
              {job.deadline && (
                <p className="text-xs text-gray-400 mt-1">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(`/hr/jobs/${job.id}/dashboard`)}
              className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
            >
              View Candidates
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}