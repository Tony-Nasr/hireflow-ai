import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/client";

type Stats = {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
};

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

type Company = {
  id: number;
  name: string;
  industry: string;
  ownerEmail: string;
  jobCount: number;
};

type Job = {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
  deadline: string | null;
  companyName: string;
  applicationCount: number;
};

type Tab = "stats" | "users" | "companies" | "jobs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await axios.get("/Admin/stats")).data,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => (await axios.get("/Admin/users")).data,
    enabled: activeTab === "users",
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ["admin-companies"],
    queryFn: async () => (await axios.get("/Admin/companies")).data,
    enabled: activeTab === "companies",
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["admin-jobs"],
    queryFn: async () => (await axios.get("/Admin/jobs")).data,
    enabled: activeTab === "jobs",
  });

  const toggleJob = useMutation({
    mutationFn: (id: number) => axios.patch(`/Admin/jobs/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => axios.delete(`/Admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "stats", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "companies", label: "Companies" },
    { key: "jobs", label: "Jobs" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers },
            { label: "Total Companies", value: stats.totalCompanies },
            { label: "Total Jobs", value: stats.totalJobs },
            { label: "Active Jobs", value: stats.activeJobs },
            { label: "Total Applications", value: stats.totalApplications },
          ].map((stat) => (
            <div key={stat.label} className="border rounded-lg p-4 bg-white shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="space-y-2">
          {users?.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 flex items-center justify-between bg-white"
            >
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${user.fullName}? This cannot be undone.`)) {
                    deleteUser.mutate(user.id);
                  }
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Companies */}
      {activeTab === "companies" && (
        <div className="space-y-2">
          {companies?.map((company) => (
            <div key={company.id} className="border rounded-lg p-4 bg-white">
              <p className="font-medium">{company.name}</p>
              <p className="text-sm text-gray-500">{company.industry}</p>
              <p className="text-xs text-gray-400 mt-1">
                Owner: {company.ownerEmail} · {company.jobCount} job(s)
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Jobs */}
      {activeTab === "jobs" && (
        <div className="space-y-2">
          {jobs?.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-4 flex items-center justify-between bg-white"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{job.title}</p>
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
                <p className="text-xs text-gray-400 mt-1">
                  {job.applicationCount} application(s)
                  {job.deadline &&
                    ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => toggleJob.mutate(job.id)}
                className="text-xs border px-3 py-1 rounded hover:bg-gray-50"
              >
                {job.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}