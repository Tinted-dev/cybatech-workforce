import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import apiClient from "../api/client"
import { getErrorMessage } from "../utils/getErrorMessage"
import { useAuth } from "../context/AuthContext"

function EmployeesPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [departmentId, setDepartmentId] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editFullName, setEditFullName] = useState("")
  const [editRole, setEditRole] = useState("employee")
  const [editDepartmentId, setEditDepartmentId] = useState("")
  const [editError, setEditError] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  async function loadData() {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        apiClient.get("/employees"),
        apiClient.get("/departments"),
      ])
      setEmployees(employeesRes.data)
      setDepartments(departmentsRes.data.filter((d) => d.is_active))
    } catch (err) {
      setError("Could not load employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setFormError("")
    setSubmitting(true)

    try {
      await apiClient.post("/employees", {
        full_name: fullName,
        email,
        password,
        role,
        department_id: departmentId ? Number(departmentId) : null,
      })
      setFullName("")
      setEmail("")
      setPassword("")
      setRole("employee")
      setDepartmentId("")
      setShowForm(false)
      await loadData()
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create employee"))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(employee) {
    try {
      await apiClient.put(`/employees/${employee.id}`, {
        is_active: !employee.is_active,
      })
      await loadData()
    } catch (err) {
      setError("Could not update employee")
    }
  }

  function startEdit(employee) {
    setEditingId(employee.id)
    setEditFullName(employee.full_name || "")
    setEditRole(employee.role)
    setEditDepartmentId(employee.department_id ? String(employee.department_id) : "")
    setEditError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError("")
  }

  async function handleEditSubmit(event, employeeId) {
    event.preventDefault()
    setEditError("")
    setEditSubmitting(true)

    try {
      await apiClient.put(`/employees/${employeeId}`, {
        full_name: editFullName,
        role: editRole,
        department_id: editDepartmentId ? Number(editDepartmentId) : null,
      })
      setEditingId(null)
      await loadData()
    } catch (err) {
      setEditError(getErrorMessage(err, "Could not update employee"))
    } finally {
      setEditSubmitting(false)
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
            <h1 className="text-lg font-semibold text-slate-800">Employees</h1>
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
            {showForm ? "Cancel" : "+ Add Employee"}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Initial password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Employee"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <ul className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <li key={employee.id} className="p-4">
                {editingId === employee.id ? (
                  <form
                    onSubmit={(e) => handleEditSubmit(e, employee.id)}
                    className="space-y-3"
                  >
                    {editError && (
                      <p className="text-sm text-red-600">{editError}</p>
                    )}
                    <input
                      type="text"
                      placeholder="Full name"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select
                      value={editDepartmentId}
                      onChange={(e) => setEditDepartmentId(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="">No department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="bg-slate-800 text-white rounded px-4 py-1.5 text-sm disabled:opacity-50"
                      >
                        {editSubmitting ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-sm text-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {employee.full_name || employee.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {employee.email} — {employee.role}
                        {employee.department_name ? ` — ${employee.department_name}` : ""}
                        {" — "}
                        {employee.is_active ? "Active" : "Deactivated"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(employee)}
                        className="text-xs rounded px-3 py-1 bg-slate-100 text-slate-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(employee)}
                        className={`text-xs rounded px-3 py-1 ${
                          employee.is_active
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {employee.is_active ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

export default EmployeesPage
