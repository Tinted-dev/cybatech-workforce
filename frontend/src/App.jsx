import { Routes, Route } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ChangePasswordPage from "./pages/ChangePasswordPage"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import EmployeesPage from "./pages/EmployeesPage"
import LocationsPage from "./pages/LocationsPage"
import AttendancePage from "./pages/AttendancePage"
import DepartmentsPage from "./pages/DepartmentsPage"

function Dashboard() {
  const { user } = useAuth()
  return user.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <LocationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <DepartmentsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
