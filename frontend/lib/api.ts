import { CabComparisonResponse, PlaceSuggestion, RecommendationResponse, Station } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  const token = window.localStorage.getItem("exit_right_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function signup(payload: { email: string; full_name: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ access_token: string; user_id: string; email: string; full_name: string }>(res);
}

export async function login(payload: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ access_token: string; user_id: string; email: string; full_name: string }>(res);
}

export async function getStations() {
  const res = await fetch(`${API_BASE}/stations`);
  return parseResponse<Station[]>(res);
}

export async function searchPlaces(query: string) {
  const params = new URLSearchParams({ q: query, limit: "5" });
  const res = await fetch(`${API_BASE}/places/search?${params.toString()}`);
  return parseResponse<PlaceSuggestion[]>(res);
}

export async function recommendRoute(payload: {
  station_id: string;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
}) {
  const res = await fetch(`${API_BASE}/recommend-route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<RecommendationResponse>(res);
}

export async function compareCabs(payload: {
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  distance_km: number;
}) {
  const res = await fetch(`${API_BASE}/compare-cabs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<CabComparisonResponse>(res);
}

export async function saveLocation(payload: {
  label: string;
  place_name: string;
  latitude: number;
  longitude: number;
}) {
  const res = await fetch(`${API_BASE}/save-location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<{ status: string; location_id: string }>(res);
}

export async function recommendationHistory() {
  const res = await fetch(`${API_BASE}/recommendation-history`, {
    headers: { ...authHeaders() },
  });
  return parseResponse<
    Array<{
      id: string;
      destination_name: string;
      recommended_mode: string;
      created_at: string;
    }>
  >(res);
}
