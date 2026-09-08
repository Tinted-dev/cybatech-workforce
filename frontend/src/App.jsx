import { Routes, Route } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import AdminDashboard from "./pages/AdminDashboard"

function Dashboard() {
  const { user } = useAuth()
  return user.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
