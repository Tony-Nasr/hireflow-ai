import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "@/api/client"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Register() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<number>(2)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const { data } = await api.post("/Auth/register", {
        fullName,
        email,
        password,
        role
      })
      setAuth(data)

      if (data.role === "HR") navigate("/hr/dashboard")
      else if (data.role === "Candidate") navigate("/candidate/dashboard")
      else if (data.role === "Admin") navigate("/admin/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">I am a</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value={2}>Candidate (looking for a job)</option>
                <option value={1}>HR (hiring)</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/" className="underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}