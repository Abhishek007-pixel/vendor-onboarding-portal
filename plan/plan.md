# Vendor Onboarding Portal — Simple Build Plan

Stack: React + TypeScript (Vite) · Python + FastAPI  
Time: 30 minutes

---

## Step 1 — Create Folder Structure (1 min)

```bash
mkdir vendor-portal
cd vendor-portal
mkdir backend
```

---

## Step 2 — Backend (8 min)

### Install dependencies
```bash
cd backend
pip install fastapi uvicorn
```

### Create `backend/main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

vendors = []

class VendorIn(BaseModel):
    name: str
    category: str
    contact_email: str

@app.post("/vendors")
def create_vendor(v: VendorIn):
    vendor = {
        "id": str(uuid4()),
        "name": v.name,
        "category": v.category,
        "contact_email": v.contact_email,
        "status": "Pending Approval"
    }
    vendors.append(vendor)
    return vendor

@app.get("/vendors")
def get_vendors():
    return vendors

@app.patch("/vendors/{vendor_id}/approve")
def approve_vendor(vendor_id: str):
    for v in vendors:
        if v["id"] == vendor_id:
            v["status"] = "Approved"
            return v
    raise HTTPException(status_code=404, detail="Not found")
```

### Run backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

✅ Check it works: open http://localhost:8000/docs — you should see Swagger UI.

---

## Step 3 — Frontend (15 min)

### Scaffold (run from vendor-portal root, NOT inside backend)
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Wipe default Vite styles (do this or UI will look broken)
```bash
echo "" > src/index.css
echo "" > src/App.css
```

### Replace `src/App.tsx` with this entire file

```tsx
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
    fetch(`${BASE}/vendors`).then(r => r.json()).then(setVendors)

  useEffect(() => { loadVendors() }, [])

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

  const displayed = filter === "All" ? vendors : vendors.filter(v => v.category === filter)

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Vendor Onboarding Portal</h1>

      {/* FORM */}
      <div style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Register New Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name<br />
              <input value={name} onChange={e => setName(e.target.value)}
                style={inputStyle} placeholder="Vendor name" />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Category<br />
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Contact Email<br />
              <input value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} placeholder="contact@email.com" />
            </label>
          </div>
          {error && <p style={{ color: "red", marginBottom: 8 }}>{error}</p>}
          <button type="submit" style={btnStyle("#4f46e5")}>Register Vendor</button>
        </form>
      </div>

      {/* FILTER BUTTONS */}
      <div style={{ marginBottom: "1rem" }}>
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{
              marginRight: 8, padding: "4px 14px", cursor: "pointer",
              background: filter === c ? "#4f46e5" : "#eee",
              color: filter === c ? "white" : "black",
              border: "none", borderRadius: 20, fontSize: 13
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* VENDOR TABLE */}
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
              <td colSpan={5} style={{ textAlign: "center", padding: 20, color: "#999" }}>
                No vendors yet.
              </td>
            </tr>
          ) : (
            displayed.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{v.name}</td>
                <td style={td}>{v.category}</td>
                <td style={td}>{v.contact_email}</td>
                <td style={td}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 12, fontSize: 13,
                    background: v.status === "Approved" ? "#d1fae5" : "#fef9c3",
                    color: v.status === "Approved" ? "#065f46" : "#78350f"
                  }}>
                    {v.status}
                  </span>
                </td>
                <td style={td}>
                  {v.status !== "Approved" && (
                    <button onClick={() => handleApprove(v.id)} style={btnStyle("#16a34a")}>
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
  display: "block", width: "100%", padding: "8px", marginTop: 4,
  border: "1px solid #ccc", borderRadius: 6, fontSize: 14
}

const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg, color: "white", border: "none",
  padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14
})

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontWeight: 600 }
const td: React.CSSProperties = { padding: "10px 12px" }
```

### Run frontend
```bash
npm run dev
```

✅ Open http://localhost:5173

---

## Step 4 — Test Everything (5 min)

Open two terminals — backend in one, frontend in the other. Then:

1. Submit the form → vendor appears in table with "Pending Approval" status
2. Click **Approve** → status turns green "Approved", button disappears
3. Click filter buttons → table filters correctly
4. Submit empty form → red error message appears
5. Submit bad email → red error message appears

---

## Full Requirements Checklist

| Requirement | Status |
|---|---|
| POST /vendors | ✅ |
| GET /vendors | ✅ |
| In-memory store (no database) | ✅ |
| Default status = "Pending Approval" | ✅ |
| CORS enabled | ✅ |
| Form: name, category, email | ✅ |
| Table showing all vendors + status | ✅ |
| List updates after form submit | ✅ |
| Filter by category (bonus) | ✅ |
| Approve button per vendor (bonus) | ✅ |
| Form validation — empty fields (bonus) | ✅ |
| Form validation — email format (bonus) | ✅ |
| Clean usable UI (bonus) | ✅ |

---

## If Something Breaks

| Problem | Fix |
|---|---|
| `uvicorn: command not found` | Run `pip install fastapi uvicorn` again, make sure you're in the right folder |
| CORS error in browser console | Check `CORSMiddleware` is in `main.py` exactly as shown |
| UI looks broken / weird fonts | You didn't wipe `index.css` — run `echo "" > src/index.css` |
| Port 8000 already in use | Use `uvicorn main:app --reload --port 8001` and change `BASE` in `App.tsx` to `http://localhost:8001` |
| `npm create vite` hangs or errors | Try `npx create-vite@latest frontend --template react-ts` instead |
| Table doesn't update after submit | Make sure backend is running on port 8000 and CORS is enabled |
