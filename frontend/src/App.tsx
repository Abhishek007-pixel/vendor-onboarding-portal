import { useState, useEffect } from "react"

const BASE = "http://localhost:8000"
const CATEGORIES = ["Staffing Agency", "Freelance Platform", "Consultant"]

interface Vendor {
  id: string
  name: string
  category: string
  contact_email: string
  status: string
}

export default function App() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [name, setName] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")

  const loadVendors = () =>
    fetch(`${BASE}/vendors`).then((r) => r.json()).then(setVendors)

  useEffect(() => {
    loadVendors()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address")
      return
    }
    setError("")
    await fetch(`${BASE}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, contact_email: email }),
    })
    setName("")
    setEmail("")
    setCategory(CATEGORIES[0])
    loadVendors()
  }

  const handleApprove = async (id: string) => {
    await fetch(`${BASE}/vendors/${id}/approve`, { method: "PATCH" })
    loadVendors()
  }

  const displayed =
    filter === "All" ? vendors : vendors.filter((v) => v.category === filter)

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Vendor Onboarding Portal</h1>

      <div
        style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: 8,
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Register New Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Name
              <br />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Vendor name"
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Category
              <br />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Contact Email
              <br />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="contact@email.com"
              />
            </label>
          </div>
          {error && (
            <p style={{ color: "red", marginBottom: 8 }}>{error}</p>
          )}
          <button type="submit" style={btnStyle("#4f46e5")}>
            Register Vendor
          </button>
        </form>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              marginRight: 8,
              padding: "4px 14px",
              cursor: "pointer",
              background: filter === c ? "#4f46e5" : "#eee",
              color: filter === c ? "white" : "black",
              border: "none",
              borderRadius: 20,
              fontSize: 13,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>Name</th>
            <th style={th}>Category</th>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayed.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{ textAlign: "center", padding: 20, color: "#999" }}
              >
                No vendors yet.
              </td>
            </tr>
          ) : (
            displayed.map((v) => (
              <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{v.name}</td>
                <td style={td}>{v.category}</td>
                <td style={td}>{v.contact_email}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 13,
                      background:
                        v.status === "Approved" ? "#d1fae5" : "#fef9c3",
                      color:
                        v.status === "Approved" ? "#065f46" : "#78350f",
                    }}
                  >
                    {v.status}
                  </span>
                </td>
                <td style={td}>
                  {v.status !== "Approved" && (
                    <button
                      onClick={() => handleApprove(v.id)}
                      style={btnStyle("#16a34a")}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "8px",
  marginTop: 4,
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
}

const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg,
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
})

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 600,
}
const td: React.CSSProperties = { padding: "10px 12px" }
