import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/api/client"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Job {
  id: number
  title: string
  description: string
  requirements: string
  salary: number | null
  deadline: string
  companyName: string
}

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const navigate = useNavigate()
  const { accessToken, role } = useAuthStore()

  useEffect(() => {
    api.get("/Job")
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleApply = async (jobId: number) => {
    const fileInput = fileRefs.current[jobId]
    if (!fileInput?.files?.[0]) {
      setMessage("Please select a CV file first.")
      return
    }

    setApplying(jobId)
    setMessage("")

    const formData = new FormData()
    formData.append("cv", fileInput.files[0])
    formData.append("coverLetter", "Applying via HireFlow AI platform.")

    try {
      await api.post(`/Application/apply/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setMessage("Application submitted successfully!")
      navigate("/candidate/dashboard")
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to apply.")
    } finally {
      setApplying(null)
    }
  }

  if (loading) return <div className="p-8">Loading jobs...</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        {!accessToken ? (
          <Button variant="outline" onClick={() => navigate("/")}>
            Login to Apply
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate("/candidate/dashboard")}>
            My Applications
          </Button>
        )}
      </div>

      {message && (
        <p className="mb-4 text-sm text-green-600 font-medium">{message}</p>
      )}

      {jobs.length === 0 && (
        <p className="text-gray-500">No open positions at the moment.</p>
      )}

      <div className="space-y-4">
        {jobs.map(job => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{job.companyName}</p>
                </div>
                <div className="flex gap-2">
                  {job.salary && (
                    <Badge variant="secondary">${job.salary}/mo</Badge>
                  )}
                  <Badge>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{job.description}</p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Requirements:</span> {job.requirements}
              </p>

              {accessToken && role === "Candidate" && (
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    ref={el => { fileRefs.current[job.id] = el }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleApply(job.id)}
                    disabled={applying === job.id}
                  >
                    {applying === job.id ? "Applying..." : "Apply Now"}
                  </Button>
                </div>
              )}

              {!accessToken && (
                <Button size="sm" variant="outline" onClick={() => navigate("/register")}>
                  Register to Apply
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}