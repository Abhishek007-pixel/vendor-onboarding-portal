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

Open http://localhost:8000/docs for the API.

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — ensure the backend is running on port 8000.

## Features

- `POST /vendors` — register a vendor (default status: Pending Approval)
- `GET /vendors` — list vendors
- `PATCH /vendors/{id}/approve` — approve a vendor
- UI: form validation, category filters, approve action

See `plan/plan.md` for the full checklist.
