# Vendor Onboarding Portal

React + TypeScript (Vite) frontend and FastAPI backend with in-memory vendor storage.

## Run locally

**Backend** (terminal 1):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** (Swagger UI) and test the API there first — see [Testing](#testing).

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — ensure the backend is running on port 8000.

## Testing

**Start with Swagger UI** (interactive, no code): confirm the API before the React app or pytest.

### 1. FastAPI — Swagger UI (do this first)

1. Start the backend (from `backend`):

   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. In the browser open **http://localhost:8000/docs** — FastAPI serves **Swagger UI** here (built from the OpenAPI schema).

3. **POST `/vendors`** — click it → **Try it out** → body example:

   ```json
   {
     "name": "Test Vendor",
     "category": "Staffing Agency",
     "contact_email": "test@example.com"
   }
   ```

   **Execute**. Response should include `"status": "Pending Approval"` and an `id` (copy the `id`).

4. **GET `/vendors`** — **Try it out** → **Execute**. You should see the vendor you created in the array.

5. **PATCH `/vendors/{vendor_id}/approve`** — **Try it out** → paste the `id` from step 3 into `vendor_id` → **Execute**. Response should show `"status": "Approved"`.

6. Optional: call **GET `/vendors`** again to confirm the row shows **Approved**.

**Also available:** **http://localhost:8000/redoc** (ReDoc, same API, different layout).

### 2. Automated tests (pytest)

After Swagger looks good, you can run the suite from `backend`:

```bash
cd backend
pip install -r requirements.txt
python -m pytest tests -v
```

These hit the same routes as Swagger (empty list, create, approve, 404, OpenAPI schema).

### 3. Frontend + API together

With backend on **8000** and `npm run dev` on **5173**, use the form and table; behavior should match what you saw in Swagger.

## UI layout (what you’ll see)

![UI preview](docs/ui-preview.png)

- **Title:** “Vendor Onboarding Portal” at the top.
- **Register New Vendor:** Light gray card (`#f9f9f9`) with fields **Name**, **Category** (dropdown: Staffing Agency, Freelance Platform, Consultant), **Contact Email**, red validation messages if needed, and an indigo **Register Vendor** button (`#4f46e5`).
- **Filters:** Pill buttons — **All** plus the three categories; active filter is indigo, others gray.
- **Table:** Columns **Name**, **Category**, **Email**, **Status**, **Action**. Status is a pill: yellow/cream (`#fef9c3` / `#78350f`) for **Pending Approval**, green (`#d1fae5` / `#065f46`) for **Approved**. **Approve** (green button) appears only while status is not Approved.

## Features

- `POST /vendors` — register a vendor (default status: Pending Approval)
- `GET /vendors` — list vendors
- `PATCH /vendors/{id}/approve` — approve a vendor
- UI: form validation, category filters, approve action

---

## Prompts used

### 1. Planning (Claude Sonnet 4.6)

First pass was only the plan: stack, file layout, and build order so the actual coding stayed linear.

```
Teckleap round 2 is a vendor onboarding portal—React + TypeScript on the front,
FastAPI on the back, in-memory store (no DB). This is a 30-minute assignment.

Give me a tight build plan: folder structure, the three endpoints I actually need,
default vendor status, CORS note, and the exact Vite/React steps. Include a hard
step to wipe both src/index.css and src/App.css to empty before building the UI (not
just a vague “gotcha”). Order the steps so backend comes before UI.

Bonus checklist—name these three explicitly so nothing gets missed: (1) filter vendors
by category, (2) Approve button per row, (3) form validation for empty fields and email
format.
```

### 2. Implementation

What we used to implement against a local `plan.md` and problem-statement PDF (git and README were added afterward, not in this prompt). Those files are not part of this repository.

```
Read plan.md and the problem statement PDF in plan/. Scaffold FastAPI: POST /vendors,
GET /vendors, PATCH /vendors/{id}/approve; in-memory list; default new vendor status
"Pending Approval"; CORS for local dev.

Vite + React + TypeScript: before you write UI code, wipe src/index.css and
src/App.css completely (empty files). API base URL http://localhost:8000.

TypeScript Vendor type must match the API: id, name, category, contact_email, status.

Table columns in order: Name, Category, Email, Status, Action. Status badges: if
Approved use background #d1fae5 and text #065f46; otherwise (e.g. Pending Approval)
background #fef9c3 and text #78350f. Approve button only when status is not Approved;
hide it once approved.

Form: name, category (dropdown: Staffing Agency, Freelance Platform, Consultant),
contact email; reload the list after a successful POST. Category filter chips: All
plus those three categories.

Do not add git, do not add a README yet.
```

The first prompt matches the spec timebox and locks the three bonuses plus the CSS wipe. The second prompt fixes paths, removes repo push from the build step so the agent does not stall, pins the UI contract, and defers git/README until you choose.
