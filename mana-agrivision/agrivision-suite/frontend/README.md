# Mana Polam AgriVision Suite — Updated Frontend

This package is an update of the frontend ZIP you uploaded. It keeps the React + Vite application and existing farm pages, and replaces the dashboard presentation with three distinct, responsive level-specific dashboards inspired by your reference image.

## What changed
- Beginner dashboard: welcome hero, daily task checklist, step-by-step farming guide, crop/land/learning shortcuts.
- Intermediate dashboard: live counts from saved farm/crop/task/expense records, crop monitoring, crop-specific reminder entry point, weather and market panels.
- Expert dashboard: farm operations summary, performance/report entry point, AI crop-health entry point, advanced tools and quick insights.
- Sidebar navigation changes according to the farmer's selected level.
- Dashboard data is requested from the FastAPI API using the signed-in user's JWT.
- API errors and missing records are represented as empty/loading states; the frontend does not fabricate live weather, mandi prices, disease results, yield or profit numbers.
- Existing farm, crop, task, expense, inventory, soil/irrigation, weather, market, marketplace and analytics pages are retained.

## Run the frontend
1. Install Node.js 20 or later.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Set `VITE_API_BASE_URL` to your running FastAPI backend, for example:
   `VITE_API_BASE_URL=http://127.0.0.1:8000`
6. Run `npm run dev`.
7. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Backend connection
The shared API client is `src/Services/api.js`. It:
- Reads `VITE_API_BASE_URL`.
- Adds `Authorization: Bearer <access_token>` for authenticated requests.
- Sends JSON for JSON request bodies.
- Surfaces FastAPI validation and HTTP errors in the frontend.
- Maps the UI's `/api/v1/soil-irrigation` path to the existing `/api/v1/soil` resource path.

The current frontend expects the backend routes used by the existing pages, including:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET/POST/PUT/DELETE /api/v1/farms`
- `GET/POST/PUT/DELETE /api/v1/crops`
- `GET/POST/PUT/DELETE /api/v1/tasks`
- `GET/POST /api/v1/expenses`
- `GET/POST/DELETE /api/v1/inventory`
- `GET/POST /api/v1/soil`
- `GET /api/v1/market/prices` and market watchlist routes
- `GET /api/v1/weather` (provider-backed)

The dashboard loads farms, crops, tasks, expenses and inventory from the corresponding resource endpoints and derives counts/totals from the returned records. If your backend uses different route names or response shapes, those need to be aligned in the API client or page component.

## Important backend setup
- Start FastAPI on the URL configured in `.env`.
- Configure FastAPI CORS to allow the frontend origin, e.g. `http://localhost:5173`.
- Keep Supabase service-role keys, JWT secrets, weather keys and AI provider keys on the backend only.
- Verify every protected route checks the authenticated user's ownership of the requested records.
- The selected dashboard level changes the interface and navigation only; it is not an authorization role.
- Registration sends `role: "farmer"` and the selected `level` / `experience_level`. Expert/admin permissions must be granted and validated by the backend, never by trusting browser state.

## Scope and verification
This ZIP contains the frontend only. Your backend source was not included in this upload, so I could not change backend route implementations, database policies, Supabase schema, CORS settings or provider configuration, and I could not run authenticated end-to-end tests against your live backend.

The edited React files were syntax-parsed successfully. A full Vite production build was not confirmed in this environment because the uploaded `node_modules` contained platform-specific native packages. Run `npm install` on your own machine and then `npm run build` to verify the local install.

No `.env`, API keys, database passwords, JWT secrets or `node_modules` are included in this ZIP.
