import JobListings from "@/pages/candidate/JobListings"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import HRDashboard from "@/pages/hr/HRDashboard"
import CandidateDashboard from "@/pages/candidate/CandidateDashboard"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import ProtectedRoute from "@/components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App