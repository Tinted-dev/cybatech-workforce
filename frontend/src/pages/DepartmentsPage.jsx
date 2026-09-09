import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { useAuth } from "../context/AuthContext"
import { getErrorMessage } from "../utils/getErrorMessage"

function DepartmentsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function fetchDepartments() {
    try {
      const response = await apiClient.get("/departments")
      setDepartments(response.data)
    } catch (err) {
      setError("Could not load departments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setFormError("")
    setSubmitting(true)

    try {
      await apiClient.post("/departments", { name })
      setName("")
      setShowForm(false)
      await fetchDepartments()
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create department"))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(department) {
    try {
      await apiClient.put(`/departments/${department.id}`, {
        is_active: !department.is_active,
      })
      await fetchDepartments()
    } catch (err) {
      setError("Could not update department")
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
            <h1 className="text-lg font-semibold text-slate-800">Departments</h1>
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
            {showForm ? "Cancel" : "+ Add Department"}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <input
                type="text"
                placeholder="Department name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Department"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <ul className="divide-y divide-slate-100">
            {departments.map((department) => (
              <li
                key={department.id}
                className="flex justify-between items-center p-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {department.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {department.is_active ? "Active" : "Deactivated"}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(department)}
                  className={`text-xs rounded px-3 py-1 ${
                    department.is_active
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {department.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

export default DepartmentsPage
