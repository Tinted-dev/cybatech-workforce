import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"

function AttendancePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadAttendance() {
      try {
        const response = await apiClient.get("/attendance")
        setAttendance(response.data)
      } catch (err) {
        setError("Could not load attendance records")
      } finally {
        setLoading(false)
      }
    }
    loadAttendance()
  }, [])

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-500 mb-2"
            >
              &larr; Back to dashboard
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              Attendance History
            </h1>
          </div>
          <button onClick={logout} className="text-sm text-slate-500">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Clock In</th>
                <th className="px-4 py-3 font-medium">Clock Out</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-slate-700">
                    {record.employee_full_name || record.employee_email || `#${record.employee_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {record.department_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {toLocalDate(record.clock_in_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.clock_out_time
                      ? toLocalDate(record.clock_out_time).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {record.clock_out_time ? (
                      <span className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-1">
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-600 rounded px-2 py-1">
                        Clocked In
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendance.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No attendance records yet.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default AttendancePage
