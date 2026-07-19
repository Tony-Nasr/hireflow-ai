import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/api/client"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Application {
  id: number
  jobTitle: string
  companyName: string
  stage: string
  aiScore: number | null
  aiFeedback: string | null
  appliedAt: string
}

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { fullName, logout } = useAuthStore()

  useEffect(() => {
    api.get("/Application/my-applications")
      .then(res => setApplications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const stageColor: Record<string, string> = {
    Applied: "secondary",
    Screened: "outline",
    Interview: "default",
    Offer: "default",
    Hired: "default",
    Rejected: "destructive"
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-gray-500">Welcome, {fullName}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && applications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <Button onClick={() => navigate("/jobs")}>Browse Open Positions</Button>
        </div>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{app.jobTitle}</CardTitle>
                  <p className="text-sm text-gray-500">{app.companyName}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {app.aiScore !== null && (
                    <Badge variant="outline">AI Score: {app.aiScore}/100</Badge>
                  )}
                  <Badge>{app.stage}</Badge>
                </div>
              </div>
            </CardHeader>
            {app.aiFeedback && (
              <CardContent>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">AI Feedback:</span> {app.aiFeedback}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}