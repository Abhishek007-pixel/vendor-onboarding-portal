"""API tests (same HTTP surface as Swagger UI at /docs)."""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_vendors_empty():
    r = client.get("/vendors")
    assert r.status_code == 200
    assert r.json() == []


def test_post_vendor_default_status():
    r = client.post(
        "/vendors",
        json={
            "name": "Acme Staffing",
            "category": "Staffing Agency",
            "contact_email": "hello@acme.example",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert data["name"] == "Acme Staffing"
    assert data["category"] == "Staffing Agency"
    assert data["contact_email"] == "hello@acme.example"
    assert data["status"] == "Pending Approval"


def test_list_after_create():
    client.post(
        "/vendors",
        json={
            "name": "B Co",
            "category": "Consultant",
            "contact_email": "b@example.com",
        },
    )
    r = client.get("/vendors")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_approve_vendor():
    created = client.post(
        "/vendors",
        json={
            "name": "C Co",
            "category": "Freelance Platform",
            "contact_email": "c@example.com",
        },
    ).json()
    vid = created["id"]

    r = client.patch(f"/vendors/{vid}/approve")
    assert r.status_code == 200
    assert r.json()["status"] == "Approved"

    listed = client.get("/vendors").json()
    assert listed[0]["status"] == "Approved"


def test_approve_unknown_returns_404():
    r = client.patch("/vendors/00000000-0000-0000-0000-000000000000/approve")
    assert r.status_code == 404


def test_openapi_docs_available():
    """Swagger UI loads from /docs; schema is at /openapi.json."""
    r = client.get("/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    assert spec["openapi"].startswith("3")
    paths = spec["paths"]
    assert "/vendors" in paths
    assert "post" in paths["/vendors"]
    assert "get" in paths["/vendors"]
