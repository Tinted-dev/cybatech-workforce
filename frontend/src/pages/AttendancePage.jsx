import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"

function AttendancePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [locationId, setLocationId] = useState("")

  async function loadFilterOptions() {
    try {
      const [employeesRes, locationsRes] = await Promise.all([
        apiClient.get("/employees"),
        apiClient.get("/locations"),
      ])
      setEmployees(employeesRes.data)
      setLocations(locationsRes.data)
    } catch (err) {
      // Non-fatal - filters just won't have dropdown options
    }
  }

  async function loadAttendance() {
    setLoading(true)
    setError("")
    try {
      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (employeeId) params.employee_id = employeeId
      if (locationId) params.location_id = locationId

      const response = await apiClient.get("/attendance", { params })
      setAttendance(response.data)
    } catch (err) {
      setError("Could not load attendance records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilterOptions()
    loadAttendance()
  }, [])

  function handleFilterSubmit(event) {
    event.preventDefault()
    loadAttendance()
  }

  function clearFilters() {
    setStartDate("")
    setEndDate("")
    setEmployeeId("")
    setLocationId("")
    setTimeout(loadAttendance, 0)
  }

  function exportCsv() {
    const headers = [
      "Employee",
      "Email",
      "Department",
      "Clock In",
      "Clock Out",
      "Status",
    ]

    const rows = attendance.map((record) => [
      record.employee_full_name || "",
      record.employee_email || "",
      record.department_name || "",
      toLocalDate(record.clock_in_time).toLocaleString(),
      record.clock_out_time ? toLocalDate(record.clock_out_time).toLocaleString() : "",
      record.clock_out_time ? "Completed" : "Clocked In",
    ])

    const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
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

        <form
          onSubmit={handleFilterSubmit}
          className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">All employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || emp.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-slate-800 text-white rounded px-4 py-1.5 text-sm"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-slate-500"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={attendance.length === 0}
            className="ml-auto bg-green-600 text-white rounded px-4 py-1.5 text-sm disabled:opacity-50"
          >
            Export CSV
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate-500 p-6 text-center">Loading...</p>
          ) : (
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
          )}

          {!loading && attendance.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No attendance records match these filters.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default AttendancePage
