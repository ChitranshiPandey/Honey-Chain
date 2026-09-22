from app.auth import API_KEY

AUTH_HEADERS = {"X-API-Key": API_KEY}


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_create_batch_success(client):
    res = client.post(
        "/batches",
        json={"hiveId": "H001", "extractionDate": "1 Jan 2026", "quantityKg": 5.5},
        headers=AUTH_HEADERS,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["hiveId"] == "H001"
    assert body["status"] == "Verified"
    assert body["txHash"]


def test_create_batch_requires_api_key(client):
    res = client.post(
        "/batches",
        json={"hiveId": "H001", "extractionDate": "1 Jan 2026", "quantityKg": 5.5},
    )
    assert res.status_code == 401


def test_create_batch_unknown_hive_returns_404(client):
    res = client.post(
        "/batches",
        json={"hiveId": "does-not-exist", "extractionDate": "1 Jan 2026", "quantityKg": 5.5},
        headers=AUTH_HEADERS,
    )
    assert res.status_code == 404


def test_create_batch_rejects_non_positive_quantity(client):
    res = client.post(
        "/batches",
        json={"hiveId": "H001", "extractionDate": "1 Jan 2026", "quantityKg": 0},
        headers=AUTH_HEADERS,
    )
    assert res.status_code == 422


def test_verify_found_after_create(client):
    created = client.post(
        "/batches",
        json={"hiveId": "H001", "extractionDate": "1 Jan 2026", "quantityKg": 5.5},
        headers=AUTH_HEADERS,
    ).json()

    res = client.get(f"/batches/{created['id']}/verify")
    assert res.status_code == 200
    body = res.json()
    assert body["found"] is True
    assert body["chainConfirmed"] is True


def test_verify_unknown_batch_returns_not_found(client):
    res = client.get("/batches/does-not-exist/verify")
    assert res.status_code == 200
    assert res.json() == {"found": False, "batch": None, "chainConfirmed": False}


def test_admin_requires_api_key(client):
    res = client.get("/admin/stats")
    assert res.status_code == 401

    res = client.get("/admin/stats", headers=AUTH_HEADERS)
    assert res.status_code == 200
