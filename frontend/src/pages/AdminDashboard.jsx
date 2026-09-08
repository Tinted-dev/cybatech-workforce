import { useEffect, useState } from "react"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"

function AdminDashboard() {
  const { logout } = useAuth()
  const [employees, setEmployees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [employeesRes, attendanceRes] = await Promise.all([
          apiClient.get("/employees"),
          apiClient.get("/attendance"),
        ])
        setEmployees(employeesRes.data)
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

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-slate-800">Admin Dashboard</h1>
          <button onClick={logout} className="text-sm text-slate-500">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
        </div>
      </div>
    </main>
  )
}

export default AdminDashboard
