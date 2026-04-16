# EXIT RIGHT - Version 1

Production-ready commuter intelligence platform for Chennai Metro riders to choose:
- best station exit gate
- best last-mile mode (Walking / Shared Auto / Bus / Cab)
- cheapest + recommended cab provider (Uber / Ola / Rapido / Namma Yatri)

## 1. Project Structure

```text
exit-right/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── recommendation.py
│   │   │   └── stations.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── data/chennai_metro.json
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── recommendation_engine.py
│   │   │   ├── exit_direction_service.py
│   │   │   ├── cab_comparison_service.py
│   │   │   ├── crowd_service.py
│   │   │   ├── weather_service.py
│   │   │   ├── safety_service.py
│   │   │   └── adaptive_weight_engine.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── station-selector/page.tsx
│   │   ├── destination-input/page.tsx
│   │   ├── recommendation/page.tsx
│   │   ├── transport-comparison/page.tsx
│   │   ├── cab-comparison/page.tsx
│   │   ├── saved-locations/page.tsx
│   │   ├── recommendation-history/page.tsx
│   │   ├── settings/page.tsx
│   │   └── settings/notifications/page.tsx
│   ├── components/
│   └── lib/
├── db/
│   ├── schema.sql
│   └── seed_chennai.sql
├── render.yaml
└── docker-compose.yml
```

## 2. Setup

### Backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 3. Required Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` (Supabase PostgreSQL)
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `JWT_EXP_MINUTES`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `OPENWEATHER_API_KEY`
- `FRONTEND_BASE_URL`

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 4. Recommendation Engines

### Exit Selection Engine
- Calculates haversine distance from every exit gate to destination coordinates.
- Returns nearest exit gate as recommendation.

### Adaptive Weighting
- Morning/evening peak: time weight increases.
- Night: safety weight increases.
- Rain: weather and distance penalties increase.

### Transport Scoring

```text
final_score =
  w1 * travel_time +
  w2 * travel_cost +
  w3 * distance +
  w4 * crowd_density +
  w5 * weather_penalty +
  w6 * (1 - safety_score)
```

Lowest score wins.

### Crowd Engine
- Uses time-of-day, weekday/weekend, and station popularity index.
- Returns `LOW`, `MEDIUM`, or `HIGH`.

### Weather Impact Engine
- Rain increases:
  - walking penalty
  - shared auto wait penalty
  - bus delay penalty

### Cab Comparison Engine
- Estimates fares using base fare + distance multiplier + demand factor.
- Sorts providers by estimated price.
- Marks:
  - `cheapest` badge
  - `recommended` badge

### Deep Linking
- App deep link first, fallback website after timeout:
  - Uber
  - Ola
  - Rapido
  - Namma Yatri

## 5. API Endpoints + JSON Samples

### `POST /auth/signup`
Request:
```json
{
  "email": "user@example.com",
  "full_name": "Arun Kumar",
  "password": "StrongPass123"
}
```
Response:
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "Arun Kumar"
}
```

### `POST /auth/login`
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

### `GET /stations`
```json
[
  {
    "id": "uuid",
    "name": "Guindy",
    "city": "Chennai",
    "line_code": "Blue",
    "latitude": 13.0089,
    "longitude": 80.2127,
    "popularity_index": 0.82
  }
]
```

### `GET /stations/{station_id}/exits`
```json
[
  {
    "id": "uuid",
    "station_id": "uuid",
    "gate_code": "G1",
    "gate_name": "GST Road Exit",
    "latitude": 13.0092,
    "longitude": 80.2122,
    "road_type": "main_road",
    "lighting_score": 0.88
  }
]
```

### `POST /recommend-exit`
```json
{
  "station_id": "uuid",
  "destination_name": "Tidel Park",
  "destination_lat": 12.985,
  "destination_lng": 80.248
}
```

### `POST /recommend-route`
```json
{
  "station_id": "uuid",
  "destination_name": "Tidel Park",
  "destination_lat": 12.985,
  "destination_lng": 80.248
}
```

### `POST /compare-cabs`
```json
{
  "pickup_lat": 13.0089,
  "pickup_lng": 80.2127,
  "drop_lat": 12.985,
  "drop_lng": 80.248,
  "distance_km": 8.2
}
```

### `GET /crowd-score?station_id=...`
```json
{
  "station_id": "uuid",
  "crowd_level": "HIGH",
  "crowd_density": 0.81,
  "hour": 9,
  "weekday": 1
}
```

### `GET /weather-impact?lat=...&lng=...`
```json
{
  "weather_main": "Rain",
  "rain_mm": 2.1,
  "walking_penalty": 0.38,
  "shared_auto_wait_penalty": 0.24,
  "bus_delay_penalty": 0.2
}
```

### `POST /save-location`
```json
{
  "label": "Office",
  "place_name": "DLF IT Park",
  "latitude": 12.991,
  "longitude": 80.232
}
```

### `GET /recommendation-history`
Returns latest 50 recommendation logs for authenticated user.

### `POST /feedback`
```json
{
  "recommendation_id": "uuid",
  "rating": 5,
  "comments": "Exit suggestion was accurate."
}
```

## 6. Deployment

### Frontend on Vercel
1. Import `frontend` as Vercel project.
2. Set env vars:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Build command: `npm run build`
4. Output: Next.js default.

### Backend on Railway
1. Deploy repo with `backend/railway.json` and `backend/Dockerfile`.
2. Set backend env vars from `backend/.env.example`.
3. Expose port `8000`.

### Backend on Render
1. Use `render.yaml`.
2. Set secrets for DB + API keys.
3. Ensure `FRONTEND_BASE_URL` points to Vercel domain.

### Supabase
1. Run `db/schema.sql` in SQL editor.
2. Run `db/seed_chennai.sql`.
3. Copy pooled connection string into `DATABASE_URL`.
