"""Tests for /health and /stations endpoints."""
import pytest


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "exit-right-api"


@pytest.mark.asyncio
async def test_stations_returns_list(client):
    r = await client.get("/stations")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_stations_exits_invalid_uuid(client):
    r = await client.get("/stations/not-a-uuid/exits")
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_stations_exits_unknown_id(client):
    r = await client.get("/stations/00000000-0000-0000-0000-000000000000/exits")
    assert r.status_code == 404
