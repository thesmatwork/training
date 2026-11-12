# Mana Agrivision Backend

FastAPI + Supabase PostgreSQL REST API designed to integrate with the supplied React + Vite frontend. The frontend package is not modified or included in this backend ZIP.

## 1. Requirements
- Python 3.11+
- A Supabase project (PostgreSQL)
- Node/React frontend already uses `VITE_API_BASE_URL`

## 2. Setup

### Windows PowerShell
```powershell
cd mana-agrivision-backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (backend only; never put this in Vite)
- `SECRET_KEY` (generate a long random secret)
- `CORS_ORIGINS` (your actual frontend origins)

### Apply database migration
1. Open Supabase Dashboard → SQL Editor.
2. Paste and run `supabase/migrations/202611120001_initial_schema.sql`.
3. Keep the service-role key only in backend `.env`. Never commit `.env`.

### Run
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Health: http://127.0.0.1:8000/health
- Swagger: http://127.0.0.1:8000/docs
- OpenAPI: http://127.0.0.1:8000/openapi.json

## 3. Connect existing frontend
In the existing frontend `.env` (not `.env.example`), set:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
Restart Vite after changing the environment file. Existing frontend API helper already sends `Authorization: Bearer <token>` and uses `/api/v1`. Its `/api/v1/soil-irrigation` path is normalized to `/api/v1/soil` by its current API helper; this backend supports `/api/v1/soil`.

Login and registration return:
```json
{
  "access_token": "<JWT>",
  "token_type": "bearer",
  "user": {"id": "...", "name": "...", "email": "...", "level": "beginner"}
}
```
The browser must store only the access token and safe user profile. Password hashes remain server-side.

## 4. Implemented API areas
- Authentication: register, login, logout, current profile, profile update
- Level dashboards: beginner, intermediate, expert, summary counts
- Farms, crops, tasks, expenses, inventory, soil/irrigation, harvests
- Weather provider adapter
- Market prices and per-user watchlist
- Learning resource catalog and per-user progress
- Community posts, comments, likes
- Expert questions and expert answer endpoint
- AI farming assistant conversation history and configurable OpenAI-compatible chat completion
- Crop disease case history and safe unconfigured detection response
- Government scheme catalog and saved schemes
- Marketplace listings
- Reports/profitability summary
- Notifications and mark-read action

Resource records are stored as JSONB in dedicated PostgreSQL tables and returned as flattened JSON objects to keep the frontend's normal field shape. All resource CRUD is scoped to the authenticated user's `user_id`.

## 5. External integrations / limitations
These features require real provider setup before they can return live results:
- Weather: OpenWeather-compatible endpoint and `OPENWEATHER_API_KEY`.
- Mandi prices: configure a trusted official/licensed provider URL and key. No sample market prices are returned as live.
- AI assistant: `OPENAI_API_KEY`; uses the OpenAI chat-completions API. Provider/model availability and costs depend on your account.
- Crop disease detection: requires a validated crop/disease model or specialist provider. This backend intentionally returns HTTP 503 instead of inventing a diagnosis.
- Google sign-in: `GOOGLE_CLIENT_ID` is not sufficient alone; a provider token verification adapter must be implemented and configured. Endpoint reports this limitation.
- SMS/OTP: requires an SMS gateway adapter and credentials. No fake OTP is sent.
- Private image upload/storage: Supabase Storage bucket and signed upload/download flow are not yet wired. Do not send private farm images to public storage.
- Email/push notifications and payments: require provider credentials and delivery/payment workflows. In-app notification records are supported.

Government schemes and learning content tables are ready for verified/admin-curated records; the backend does not invent scheme eligibility or deadlines. Marketplace listing CRUD/catalog is available, but payment collection is not implemented.

## 6. Security notes
- Passwords are bcrypt-hashed.
- JWT access tokens are signed with `SECRET_KEY`.
- Protected routes require a valid bearer token.
- Record CRUD is owner-scoped on the server.
- The service-role key bypasses Supabase RLS; therefore it must stay private and every server query must enforce ownership. Enable database backups and rotate keys if exposed.
- Configure HTTPS, rate limiting, request-size limits, logging redaction, backups, and production CORS before deployment.
- Stateless logout clears the client session; use a token revocation table if immediate server-side revocation is required.

## 7. Tests
```powershell
pip install -r requirements.txt
pytest -q
python -m compileall app tests
```
Tests cover syntax/import health and password/JWT primitives. Run integration tests against a non-production Supabase project before deployment.

## 8. Data model
See `supabase/migrations/202611120001_initial_schema.sql`. The migration creates profiles, resource tables, community comments/likes, learning resources, schemes and marketplace listings with indexes and RLS enabled.
