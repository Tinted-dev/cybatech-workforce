import { useEffect, useState } from "react"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"

function EmployeeDashboard() {
  const { logout } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchStatus() {
    try {
      const response = await apiClient.get("/attendance/status")
      setStatus(response.data)
    } catch (err) {
      setError("Could not load your status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  function getLocationAndClockIn() {
    setError("")
    setActionLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiClient.post("/attendance/clock-in", {
            location_id: 1,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          await fetchStatus()
        } catch (err) {
          setError(err.response?.data?.detail || "Clock-in failed")
        } finally {
          setActionLoading(false)
        }
      },
      () => {
        setError("Location permission is required to clock in")
        setActionLoading(false)
      }
    )
  }

  function getLocationAndClockOut() {
    setError("")
    setActionLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiClient.post("/attendance/clock-out", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          await fetchStatus()
        } catch (err) {
          setError(err.response?.data?.detail || "Clock-out failed")
        } finally {
          setActionLoading(false)
        }
      },
      () => {
        setError("Location permission is required to clock out")
        setActionLoading(false)
      }
    )
  }

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  const isClockedIn = status !== null

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-slate-800">My Attendance</h1>
          <button onClick={logout} className="text-sm text-slate-500">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="mb-6">
          <p className="text-sm text-slate-500">Status</p>
          <p className="text-lg font-medium text-slate-800">
            {isClockedIn ? "Clocked in" : "Not clocked in"}
          </p>
          {isClockedIn && (
            <p className="text-sm text-slate-500 mt-1">
              Since {toLocalDate(status.clock_in_time).toLocaleTimeString()}
            </p>
          )}
        </div>

        {isClockedIn ? (
          <button
            onClick={getLocationAndClockOut}
            disabled={actionLoading}
            className="w-full bg-red-600 text-white rounded py-3 font-medium disabled:opacity-50"
          >
            {actionLoading ? "Clocking out..." : "Clock Out"}
          </button>
        ) : (
          <button
            onClick={getLocationAndClockIn}
            disabled={actionLoading}
            className="w-full bg-slate-800 text-white rounded py-3 font-medium disabled:opacity-50"
          >
            {actionLoading ? "Clocking in..." : "Clock In"}
          </button>
        )}
      </div>
    </main>
  )
}

export default EmployeeDashboard
