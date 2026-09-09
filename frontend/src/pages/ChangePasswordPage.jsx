import { useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { getErrorMessage } from "../utils/getErrorMessage"

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      localStorage.setItem("access_token", response.data.access_token)
      window.location.href = "/"
    } catch (err) {
      setError(getErrorMessage(err, "Could not change password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Change Your Password
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          You must set a new password before continuing.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <label className="block text-sm text-slate-600 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-sm text-slate-600 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-6 text-sm"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-800 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </main>
  )
}

export default ChangePasswordPage
