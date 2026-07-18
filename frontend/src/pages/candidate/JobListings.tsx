import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/api/client"
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
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/Job")
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading jobs...</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Open Positions</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Login to Apply
        </Button>
      </div>

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
              <p className="text-sm text-gray-600">
                <span className="font-medium">Requirements:</span> {job.requirements}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}