"""Tests for recommendation, cab-comparison, and auth endpoints."""
import pytest


# ── Auth ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signup_and_login(client):
    resp = await client.post(
        "/auth/signup",
        json={"email": "user@test.com", "full_name": "User One", "password": "password123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["email"] == "user@test.com"

    # Login with same credentials
    resp2 = await client.post(
        "/auth/login",
        json={"email": "user@test.com", "password": "password123"},
    )
    assert resp2.status_code == 200
    assert "access_token" in resp2.json()


@pytest.mark.asyncio
async def test_duplicate_signup(client):
    payload = {"email": "dup@test.com", "full_name": "Dup", "password": "password123"}
    await client.post("/auth/signup", json=payload)
    resp = await client.post("/auth/signup", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_bad_credentials(client):
    resp = await client.post(
        "/auth/login",
        json={"email": "nobody@test.com", "password": "wrongpassword123"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh(client):
    # Signup to get a token
    signup_resp = await client.post(
        "/auth/signup",
        json={"email": "refresh@test.com", "full_name": "Refresh User", "password": "password123"},
    )
    assert signup_resp.status_code == 200
    old_token = signup_resp.json()["access_token"]

    # Refresh should return a new token
    refresh_resp = await client.post(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {old_token}"},
    )
    assert refresh_resp.status_code == 200
    new_token = refresh_resp.json()["access_token"]
    assert new_token  # a token was returned
    assert "access_token" in refresh_resp.json()


@pytest.mark.asyncio
async def test_token_refresh_no_auth(client):
    resp = await client.post("/auth/refresh")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh_invalid_token(client):
    resp = await client.post(
        "/auth/refresh",
        headers={"Authorization": "Bearer this.is.fake"},
    )
    assert resp.status_code == 401


# ── /compare-cabs ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_compare_cabs_success(client):
    payload = {
        "distance_km": 3.5,
        "pickup_lat": 13.0827,
        "pickup_lng": 80.2707,
        "drop_lat": 13.0600,
        "drop_lng": 80.2500,
    }
    r = await client.post("/compare-cabs", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "options" in data
    assert len(data["options"]) > 0
    assert "cheapest_provider" in data
    assert "recommended_provider" in data


@pytest.mark.asyncio
async def test_compare_cabs_invalid_lat(client):
    payload = {
        "distance_km": 2.0,
        "pickup_lat": 999.0,  # invalid
        "pickup_lng": 80.27,
        "drop_lat": 13.06,
        "drop_lng": 80.25,
    }
    r = await client.post("/compare-cabs", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_compare_cabs_zero_distance(client):
    payload = {
        "distance_km": 0,  # must be > 0
        "pickup_lat": 13.08,
        "pickup_lng": 80.27,
        "drop_lat": 13.06,
        "drop_lng": 80.25,
    }
    r = await client.post("/compare-cabs", json=payload)
    assert r.status_code == 422


# ── /recommend-exit ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommend_exit_unknown_station(client):
    payload = {
        "station_id": "00000000-0000-0000-0000-000000000000",
        "destination_lat": 13.06,
        "destination_lng": 80.25,
        "destination_name": "Test Destination",
    }
    r = await client.post("/recommend-exit", json=payload)
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_recommend_exit_invalid_lat(client):
    payload = {
        "station_id": "00000000-0000-0000-0000-000000000000",
        "destination_lat": 999.0,  # out of range
        "destination_lng": 80.25,
        "destination_name": "Test",
    }
    r = await client.post("/recommend-exit", json=payload)
    assert r.status_code == 422


# ── /recommend-route (requires auth) ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommend_route_requires_auth(client):
    payload = {
        "station_id": "00000000-0000-0000-0000-000000000000",
        "destination_lat": 13.06,
        "destination_lng": 80.25,
        "destination_name": "Test",
    }
    r = await client.post("/recommend-route", json=payload)
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_recommend_route_unknown_station(auth_client):
    payload = {
        "station_id": "00000000-0000-0000-0000-000000000000",
        "destination_lat": 13.06,
        "destination_lng": 80.25,
        "destination_name": "Test",
    }
    r = await auth_client.post("/recommend-route", json=payload)
    assert r.status_code == 404
