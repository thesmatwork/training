# 10. Backend, FastAPI and Supabase

## Backend
- Python FastAPI with request validation and consistent error responses.
- Versioned API routes under `/api/v1`.
- JWT authentication and server-side authorization.
- Environment-based configuration, health endpoint and CORS allowlist.
- Keep secrets and provider API keys on the backend only.

## Database
- Supabase PostgreSQL for user and farm data.
- Use server-side ownership checks and Supabase Row Level Security where applicable.
- Keep the service-role key exclusively in backend environment variables.
- Add indexes, pagination, constraints and migrations for production workloads.

## Frontend integration
- Frontend reads `VITE_API_BASE_URL`.
- Authenticated requests send `Authorization: Bearer <access_token>`.
- Dashboard counts are derived from authenticated resource endpoints.
- Do not treat a dashboard level stored in browser state as an authorization role.

## External integrations
- Weather, mandi prices, AI provider, SMS/OTP, Google OAuth and notifications require backend-side provider setup.
- Uploads must use private storage and short-lived signed URLs.
- Display data source, update time and provider errors where available.

## Deployment
- Serve the React/Vite build over HTTPS.
- Deploy FastAPI with secure environment variables and restricted CORS.
- Monitor logs without recording passwords, OTP codes, tokens or private image URLs.
