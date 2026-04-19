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

vendors: list[dict] = []


def reset_vendors() -> None:
    """Clear in-memory store (used by tests)."""
    vendors.clear()


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
        "status": "Pending Approval",
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
