import { useEffect, useState } from "react"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { toLocalDate } from "../utils/formatDate"
import { getDeviceId } from "../utils/deviceId"
import { getErrorMessage } from "../utils/getErrorMessage"

function EmployeeDashboard() {
  const { logout } = useAuth()
  const [status, setStatus] = useState(null)
  const [locations, setLocations] = useState([])
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadInitialData() {
    try {
      const [statusRes, locationsRes] = await Promise.all([
        apiClient.get("/attendance/status"),
        apiClient.get("/locations"),
      ])
      setStatus(statusRes.data)

      const activeLocations = locationsRes.data.filter((loc) => loc.is_active)
      setLocations(activeLocations)
      if (activeLocations.length > 0) {
        setSelectedLocationId(activeLocations[0].id)
      }
    } catch (err) {
      setError("Could not load your status")
    } finally {
      setLoading(false)
    }
  }

  async function refreshStatus() {
    const response = await apiClient.get("/attendance/status")
    setStatus(response.data)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  function getLocationAndClockIn() {
    setError("")

    if (!selectedLocationId) {
      setError("Please select a location")
      return
    }

    setActionLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiClient.post("/attendance/clock-in", {
            location_id: selectedLocationId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            device_id: getDeviceId(),
          })
          await refreshStatus()
        } catch (err) {
          setError(getErrorMessage(err, "Clock-in failed"))
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
            device_id: getDeviceId(),
          })
          await refreshStatus()
        } catch (err) {
          setError(getErrorMessage(err, "Clock-out failed"))
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

        {!isClockedIn && (
          <div className="mb-4">
            <label className="block text-sm text-slate-600 mb-1">Location</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {locations.length === 0 && (
                <option value="">No locations available</option>
              )}
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            disabled={actionLoading || locations.length === 0}
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
