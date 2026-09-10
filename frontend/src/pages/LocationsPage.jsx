import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { getErrorMessage } from "../utils/getErrorMessage"
import { useAuth } from "../context/AuthContext"

function LocationsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [radius, setRadius] = useState("100")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function fetchLocations() {
    try {
      const response = await apiClient.get("/locations")
      setLocations(response.data)
    } catch (err) {
      setError("Could not load locations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setFormError("")

    const parsedLatitude = parseFloat(latitude)
    const parsedLongitude = parseFloat(longitude)
    const parsedRadius = parseInt(radius, 10)

    if (Number.isNaN(parsedLatitude)) {
      setFormError("Latitude must be a valid number, e.g. -1.286389")
      return
    }

    if (Number.isNaN(parsedLongitude)) {
      setFormError("Longitude must be a valid number, e.g. 36.817223")
      return
    }

    if (Number.isNaN(parsedRadius) || parsedRadius <= 0) {
      setFormError("Radius must be a positive whole number of meters")
      return
    }

    setSubmitting(true)

    try {
      await apiClient.post("/locations", {
        name,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        allowed_radius_meters: parsedRadius,
      })
      setName("")
      setLatitude("")
      setLongitude("")
      setRadius("100")
      setShowForm(false)
      await fetchLocations()
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create location"))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(location) {
    try {
      await apiClient.put(`/locations/${location.id}`, {
        is_active: !location.is_active,
      })
      await fetchLocations()
    } catch (err) {
      setError("Could not update location")
    }
  }

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-500 mb-2"
            >
              &larr; Back to dashboard
            </button>
            <h1 className="text-lg font-semibold text-slate-800">Locations</h1>
          </div>
          <button onClick={logout} className="text-sm text-slate-500">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-medium text-slate-800"
          >
            {showForm ? "Cancel" : "+ Add Location"}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <input
                type="text"
                placeholder="Location name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Latitude (e.g. -1.286389)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Longitude (e.g. 36.817223)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Allowed radius (meters) — how far an employee can be from
                  this point and still clock in
                </label>
                <input
                  type="text"
                  placeholder="100"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Location"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <ul className="divide-y divide-slate-100">
            {locations.map((location) => (
              <li
                key={location.id}
                className="flex justify-between items-center p-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {location.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {location.latitude}, {location.longitude} — radius{" "}
                    {location.allowed_radius_meters}m —{" "}
                    {location.is_active ? "Active" : "Deactivated"}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(location)}
                  className={`text-xs rounded px-3 py-1 ${
                    location.is_active
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {location.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

export default LocationsPage
