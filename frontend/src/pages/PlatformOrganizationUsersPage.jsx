import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation, Link } from "react-router-dom"
import platformApiClient from "../api/platformClient"
import { getErrorMessage } from "../utils/getErrorMessage"

function PlatformOrganizationUsersPage() {
  const { organizationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [resettingId, setResettingId] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetSubmitting, setResetSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(null)

  const organizationName = location.state?.organizationName

  async function fetchUsers() {
    try {
      const response = await platformApiClient.get(
        `/platform/organizations/${organizationId}/users`
      )
      setUsers(response.data)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("platform_access_token")
        navigate("/platform/login")
      } else if (err.response?.status === 404) {
        setError("Organization not found")
      } else {
        setError("Could not load users")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [organizationId])

  function startReset(userId) {
    setResettingId(userId)
    setNewPassword("")
    setResetError("")
    setResetSuccess(null)
  }

  function cancelReset() {
    setResettingId(null)
    setNewPassword("")
    setResetError("")
  }

  async function handleResetSubmit(event, userId) {
    event.preventDefault()
    setResetError("")
    setResetSubmitting(true)

    try {
      await platformApiClient.post(
        `/platform/organizations/${organizationId}/users/${userId}/reset-password`,
        { new_password: newPassword }
      )
      setResetSuccess({ userId, password: newPassword })
      setResettingId(null)
      setNewPassword("")
      await fetchUsers()
    } catch (err) {
      setResetError(getErrorMessage(err, "Could not reset password"))
    } finally {
      setResetSubmitting(false)
    }
  }

  if (loading) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/platform/organizations" className="text-sm text-slate-400">
            ← Back to organizations
          </Link>
          <h1 className="text-lg font-semibold text-white mt-2">
            {organizationName ? `${organizationName} — Users` : `Organization #${organizationId} — Users`}
          </h1>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {resetSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-sm">
            <p className="font-medium text-green-800">Password reset.</p>
            <p className="text-green-700 mt-1">
              Send this new password to the user — they'll be required to
              change it on next login:
            </p>
            <p className="text-green-800 mt-2 font-mono">
              New password: {resetSuccess.password}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-700">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <span className="text-xs bg-green-50 text-green-600 rounded px-2 py-1">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-red-50 text-red-600 rounded px-2 py-1">
                        Deactivated
                      </span>
                    )}
                    {user.must_change_password && (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-2 py-1 ml-2">
                        Must change password
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {resettingId === user.id ? (
                      <form
                        onSubmit={(e) => handleResetSubmit(e, user.id)}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                          required
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={resetSubmitting}
                          className="text-xs rounded px-3 py-1 bg-slate-800 text-white disabled:opacity-50"
                        >
                          {resetSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelReset}
                          className="text-xs text-slate-500"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => startReset(user.id)}
                        className="text-xs rounded px-3 py-1 bg-amber-50 text-amber-700"
                      >
                        Reset Password
                      </button>
                    )}
                    {resettingId === user.id && resetError && (
                      <p className="text-xs text-red-600 mt-1">{resetError}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No users found for this organization.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default PlatformOrganizationUsersPage
