import { useState } from "react"
import { useNavigate } from "react-router-dom"
import platformApiClient from "../api/platformClient"

function PlatformLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await platformApiClient.post("/platform/login", {
        email,
        password,
      })
      localStorage.setItem("platform_access_token", response.data.access_token)
      navigate("/platform/organizations")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Platform Admin
        </h1>
        <p className="text-sm text-slate-500 mb-6">Internal access only</p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <label className="block text-sm text-slate-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-sm text-slate-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-6 text-sm"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  )
}

export default PlatformLoginPage
