import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { accessToken, role } = useAuthStore()

  // Not logged in at all → send to login
  if (!accessToken) {
    return <Navigate to="/" replace />
  }

  // Logged in but wrong role → send to their own correct dashboard
  if (role && !allowedRoles.includes(role)) {
    if (role === "HR") return <Navigate to="/hr/dashboard" replace />
    if (role === "Candidate") return <Navigate to="/candidate/dashboard" replace />
    if (role === "Admin") return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}