# Frontend + Backend + Supabase integration

This update wires the existing frontend API calls to FastAPI routes and maps those routes onto the Supabase tables that were confirmed for this project. Frontend page styling/layout files were not redesigned.

## Before starting

1. Rotate the Supabase service-role key. The uploaded source archive contained a hard-coded key in `backend/app/core/config.py` and a `backend/.env` file.
2. Copy `backend/.env.example` to `backend/.env`.
3. Add the rotated service-role key and a new long random `SECRET_KEY` to `backend/.env`.
4. Create `frontend/.env` containing `VITE_API_BASE_URL=http://127.0.0.1:8000`.

## Start backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Start frontend in a second terminal

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

## Verify

Open `http://127.0.0.1:8000/health/db`. It should return `{"status":"ok","database":"connected"}`.

Then open `http://127.0.0.1:8000/docs`. Protected endpoints require a bearer token obtained from `/api/v1/auth/login` or `/api/v1/auth/register`.

## Important schema caveat

The `app_records` table has required `pk` and `sk` columns. This integration generates `pk=USER#<user_id>` and `sk=<KIND>#<uuid>`. The uploaded schema details did not establish the legacy key naming convention. Run `backend/supabase/inspect_existing_schema.sql` and compare with existing rows before production use. No existing table is dropped or recreated.

External provider integrations (weather, live market prices, AI, Google OAuth, OTP, disease detection, public schemes catalogue, payments and messaging delivery) require valid provider credentials/adapters. The backend returns an explicit unconfigured response instead of inventing results.
