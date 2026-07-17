import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"

export default function HRDashboard() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">HR Dashboard</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}