import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"

function AdminDashboard() {
  const { logout } = useAuth()
  const [employees, setEmployees] = useState([])
  const [locations, setLocations] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [employeesRes, locationsRes, attendanceRes] = await Promise.all([
          apiClient.get("/employees"),
          apiClient.get("/locations"),
          apiClient.get("/attendance"),
        ])
        setEmployees(employeesRes.data)
        setLocations(locationsRes.data)
        setAttendance(attendanceRes.data)
      } catch (err) {
        setError("Could not load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  const clockedInCount = attendance.filter((a) => a.clock_out_time === null).length
  const hasLocation = locations.length > 0
  const hasEmployee = employees.length > 0
  const onboardingComplete = hasLocation && hasEmployee

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-slate-800">Admin Dashboard</h1>
          <Link to="/employees" className="text-sm text-blue-600 ml-4">Manage Employees</Link>
          <Link to="/locations" className="text-sm text-blue-600 ml-4">Manage Locations</Link>
          <Link to="/attendance" className="text-sm text-blue-600 ml-4">View Attendance</Link>
          <Link to="/departments" className="text-sm text-blue-600 ml-4">Manage Departments</Link>
          <button onClick={logout} className="text-sm text-slate-500">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {!onboardingComplete && (
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Get your account ready
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              A couple of quick steps before your team can start clocking in.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    hasLocation
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {hasLocation ? "✓" : "1"}
                </span>
                <span className={`text-sm ${hasLocation ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  Add your first location
                </span>
                {!hasLocation && (
                  <Link to="/locations" className="text-xs text-blue-600 ml-auto">
                    Add location →
                  </Link>
                )}
              </li>
              <li className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    hasEmployee
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {hasEmployee ? "✓" : "2"}
                </span>
                <span className={`text-sm ${hasEmployee ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  Add your first employee
                </span>
                {!hasEmployee && (
                  <Link to="/employees" className="text-xs text-blue-600 ml-auto">
                    Add employee →
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-slate-500">Total Employees</p>
            <p className="text-2xl font-semibold text-slate-800">{employees.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-slate-500">Currently Clocked In</p>
            <p className="text-2xl font-semibold text-slate-800">{clockedInCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-medium text-slate-700 mb-3">Recent Attendance</h2>
          <ul className="divide-y divide-slate-100">
            {attendance.slice(0, 10).map((record) => (
              <li key={record.id} className="py-2 text-sm text-slate-600">
                <p>
                  Employee #{record.employee_id} —{" "}
                  {toLocalDate(record.clock_in_time).toLocaleString()}
                  {record.clock_out_time
                    ? ` to ${toLocalDate(record.clock_out_time).toLocaleTimeString()}`
                    : " (still clocked in)"}
                </p>
                <p className="text-xs text-slate-400">
                  Clocked in at {record.clock_in_latitude}, {record.clock_in_longitude}
                </p>
              </li>
            ))}
          </ul>
          {attendance.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No attendance records yet.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default AdminDashboard
