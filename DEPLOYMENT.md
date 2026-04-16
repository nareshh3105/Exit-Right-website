# EXIT RIGHT — Deployment Runbook

## Architecture

```
User Browser
    │
    ▼
Vercel (Next.js 16 frontend)
    │  NEXT_PUBLIC_API_BASE_URL
    ▼
Render / Railway (FastAPI backend)
    │  DATABASE_URL (postgresql+asyncpg://)
    ▼
Supabase (PostgreSQL database)
```

External APIs called by the backend:
- **OpenWeather API** — weather conditions at destination (free)
- **OpenRouteService** — real travel-time estimates for walking/driving (free, optional; heuristics used if key absent)

---

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Settings → Database → Connection string (URI)** and copy the URI.
   It looks like: `postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. **Transform** the URI for SQLAlchemy async driver:
   ```
   postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
4. Open the **SQL Editor** in Supabase and run:
   ```sql
   -- 1. Create schema
   \i db/schema.sql
   -- 2. Seed Chennai data
   \i db/seed_chennai.sql
   ```
   Or paste the file contents directly into the editor.

> The FastAPI backend also auto-seeds from `chennai_metro.json` on first startup if
> the stations table is empty — you can skip the seed SQL and let the app seed itself.

---

## 2. Backend — Render Deployment

### Using render.yaml (recommended)

The `render.yaml` in the project root is pre-configured. To deploy:

1. Push the repo to GitHub.
2. In Render dashboard → **New → Blueprint** → connect the repo.
3. Render reads `render.yaml` and creates the `exit-right-api` service automatically.
4. Set the following **environment variables** in the Render dashboard
   (Settings → Environment):

| Variable | Example / Notes |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:PW@db.XYZ.supabase.co:5432/postgres` |
| `JWT_SECRET` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` — must be ≥ 32 chars |
| `APP_ENV` | `production` |
| `FRONTEND_BASE_URL` | `https://your-app.vercel.app` |
| `OPENWEATHER_API_KEY` | Free at [openweathermap.org](https://openweathermap.org/api) — falls back to "Clear" if absent |
| `OPENROUTESERVICE_API_KEY` | Free at [openrouteservice.org](https://openrouteservice.org/dev/#/signup) — falls back to heuristics if absent |
| `GOOGLE_PLACES_API_KEY` | Optional — GCP Console, enable Places API (frontend autocomplete only) |
| `CORS_ALLOW_ORIGINS` | Leave blank unless you have a staging URL to add |
| `SENTRY_DSN` | Optional — [sentry.io](https://sentry.io) free project DSN |

5. Deploy. The service starts and auto-creates tables + seeds data.

### Manual Railway deployment

```bash
railway login
railway link          # link to your Railway project
railway up            # deploys from Dockerfile
railway variables set DATABASE_URL="postgresql+asyncpg://..."
railway variables set JWT_SECRET="..."
railway variables set APP_ENV="production"
railway variables set FRONTEND_BASE_URL="https://your-app.vercel.app"
railway variables set OPENWEATHER_API_KEY="..."
railway variables set OPENROUTESERVICE_API_KEY="..."
```

---

## 3. Frontend — Vercel Deployment

1. Push the repo to GitHub.
2. In Vercel dashboard → **New Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Set **Framework Preset** to `Next.js`.
5. Add these **Environment Variables** in the Vercel UI:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api.onrender.com` (or Railway URL) |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Optional — frontend destination autocomplete |

6. Deploy. Vercel auto-detects `next build` from `package.json`.

---

## 4. Local Development

```bash
# Clone and install
git clone <repo>
cd "exit right website"

# Backend
cd backend
cp .env.example .env          # fill in your keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local    # set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Local backend uses SQLite (no Supabase needed for dev).

### Run tests

```bash
cd backend
pytest tests/ -v
```

---

## 5. Environment Variable Reference

### Backend (`.env` / Render / Railway)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes (prod) | SQLite | Full async DB URL |
| `JWT_SECRET` | Yes | weak default | Min 32 chars, cryptographically random |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `JWT_EXP_MINUTES` | No | `1440` | Token lifetime in minutes (24 h) |
| `APP_ENV` | No | `development` | Set to `production` in prod |
| `APP_HOST` | No | `0.0.0.0` | Bind address |
| `APP_PORT` | No | `8000` | Bind port |
| `FRONTEND_BASE_URL` | Yes | `http://localhost:3000` | Primary CORS allowed origin |
| `CORS_ALLOW_ORIGINS` | No | `` | Comma-separated extra origins |
| `SENTRY_DSN` | No | `` | Sentry project DSN — leave blank to disable error tracking |
| `OPENWEATHER_API_KEY` | Recommended | `` | Falls back to "Clear" if absent |
| `OPENROUTESERVICE_API_KEY` | Optional | `` | Falls back to heuristics if absent. 2k req/day free. |
| `GOOGLE_PLACES_API_KEY` | Optional | `` | Frontend destination autocomplete only |

### Frontend (`.env.local` / Vercel)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Optional | Frontend destination autocomplete |

---

## 6. Post-Deploy Smoke Checklist

Run these checks immediately after every deployment:

```bash
API=https://your-api.onrender.com

# 1. Health check
curl $API/health
# Expected: {"status":"ok","service":"exit-right-api","env":"production"}

# 2. Stations loaded
curl $API/stations | python -m json.tool | head -30
# Expected: JSON array of Chennai metro stations

# 3. Exits for a station
STATION_ID=$(curl -s $API/stations | python -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
curl $API/stations/$STATION_ID/exits
# Expected: JSON array with gate data

# 4. Cab comparison
curl -X POST $API/compare-cabs \
  -H "Content-Type: application/json" \
  -d '{"distance_km":3.5,"pickup_lat":13.08,"pickup_lng":80.27,"drop_lat":13.06,"drop_lng":80.25}'
# Expected: {"cheapest_provider":...,"options":[...]}

# 5. Signup + recommend-route
TOKEN=$(curl -s -X POST $API/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@exitright.app","full_name":"Smoke","password":"smoketest123"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -X POST $API/recommend-route \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"station_id\":\"$STATION_ID\",\"destination_name\":\"T Nagar\",\"destination_lat\":13.04,\"destination_lng\":80.23}"
# Expected: JSON with recommended_mode, transport_ranking

# 6. CORS check from browser console (run on your Vercel domain)
# fetch('https://your-api.onrender.com/health').then(r=>r.json()).then(console.log)
# Must NOT show CORS error
```

---

## 7. Google Maps Billing Note

Each call to `/recommend-route` fires up to **3 Directions API requests** (walking,
driving, transit). At scale this can cost money.

**Recommended GCP setup:**
- Enable billing alerts at $10 / $50 / $100 thresholds.
- Restrict the API key to your backend's server IP / Render/Railway outbound IP range.
- If Maps key is absent, the engine falls back to built-in heuristics — the app still works.

---

## 8. Supabase Connection String Note

Supabase provides connection strings in the format:
```
postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

SQLAlchemy's asyncpg driver requires the `postgresql+asyncpg://` prefix:
```
postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

Make this transformation before setting `DATABASE_URL` in your deployment platform.
