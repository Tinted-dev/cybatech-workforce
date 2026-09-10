import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import platformApiClient from "../api/platformClient"

function PlatformOrganizationsPage() {
  const navigate = useNavigate()

  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function fetchOrganizations() {
    try {
      const response = await platformApiClient.get("/platform/organizations")
      setOrganizations(response.data)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("platform_access_token")
        navigate("/platform/login")
      } else {
        setError("Could not load organizations")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function toggleActive(org) {
    try {
      await platformApiClient.put(`/platform/organizations/${org.id}`, null, {
        params: { is_active: !org.is_active },
      })
      await fetchOrganizations()
    } catch (err) {
      setError("Could not update organization")
    }
  }

  function logout() {
    localStorage.removeItem("platform_access_token")
    navigate("/platform/login")
  }

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-white">
            Platform — Organizations
          </h1>
          <button onClick={logout} className="text-sm text-slate-300">
            Log out
          </button>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Employees</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3 text-slate-700">{org.name}</td>
                  <td className="px-4 py-3 text-slate-600">{org.employee_count}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(org.created_at + "Z").toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {org.is_active ? (
                      <span className="text-xs bg-green-50 text-green-600 rounded px-2 py-1">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-red-50 text-red-600 rounded px-2 py-1">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(org)}
                      className={`text-xs rounded px-3 py-1 ${
                        org.is_active
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {org.is_active ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default PlatformOrganizationsPage
