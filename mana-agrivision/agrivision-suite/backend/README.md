# Mana Agrivision Backend

FastAPI backend connected to the existing Supabase PostgreSQL project. The React/Vite frontend calls this API through `VITE_API_BASE_URL`. Existing frontend styles and layouts are preserved.

## Setup (Windows PowerShell)

```powershell
cd backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with the new Supabase project URL, the rotated service-role key, and a strong random `SECRET_KEY`. Keep this file private and do not commit it.

Run the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend connection

In `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart Vite after changing the environment file:

```powershell
cd frontend
npm.cmd run dev
```

## Verify the connection

- API root: `http://127.0.0.1:8000/`
- Backend health/config: `http://127.0.0.1:8000/health`
- Live Supabase connection check: `http://127.0.0.1:8000/health/db`
- Swagger endpoints: `http://127.0.0.1:8000/docs`
- OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

## Existing Supabase table mappings

- `app_users`: registration, login, profile and JWT user lookup.
- `farms`: farm CRUD.
- `app_records`: crops, soil records, market watchlist, community, expert questions, disease reports, saved schemes, marketplace listings and in-app notifications. Feature records are separated by `category` and `kind`.
- `farm_management`: tasks and harvest records separated by `record_type`.
- `farm_resources`: inventory and expenses separated by `resource_type`.
- `learning`: learning progress and learning resources separated by `record_type`.
- `market_data`: stored market prices.
- `ai_assistant`: assistant conversation/message history.

All user-owned CRUD queries are scoped to `owner_id` on the server. The authentication table uses `user_id`.

## Important notes

- The existing database is not dropped, recreated, or migrated by this code.
- `app_records` uses BIGINT timestamps. New app-record rows receive `pk=USER#<user_id>`, a unique `sk=<KIND>#<uuid>`, and a UUID `id`. Confirm the key convention against existing legacy records before production use.
- Inventory and expenses share `farm_resources`; `resource_type` separates the records.
- Weather requires `OPENWEATHER_API_KEY`.
- External live mandi prices require a trusted provider URL/key; otherwise the API reads the user's saved `market_data` rows.
- AI answers require `OPENAI_API_KEY`.
- Google login and SMS OTP need provider token-verification/delivery adapters; configuration values alone do not enable those flows.
- Disease detection returns HTTP 503 until a validated model/provider is configured.
- The supplied schema did not confirm a public government-schemes catalogue table. `/schemes` returns an explicit empty catalogue response instead of querying a nonexistent table.
- Payments, email/push delivery and private image upload are not implemented.

See `API_ENDPOINTS.md` for the endpoint-to-table mapping.
