# Mana Agrivision API Catalog

Base URL: `http://127.0.0.1:8000`
Prefix: `/api/v1`
Auth: `Authorization: Bearer <access_token>` unless noted. JSON request bodies are expected.

## Health
- `GET /health` — process health/config indicator
- `GET /` — API information

## Authentication
- `POST /auth/register` — `{name,email,password,level,phone?,state?}`
- `POST /auth/login` — `{email,password}`
- `POST /auth/logout` — stateless logout acknowledgement
- `GET /auth/me` — current profile
- `PATCH /auth/me` — update profile fields
- `POST /auth/google` — configuration-dependent; provider verification adapter required
- `POST /auth/otp/request`, `POST /auth/otp/verify` — provider-dependent; return 503 until SMS adapter is configured

Registration/login response: `{access_token,token_type,user}`.

## Dashboards
- `GET /dashboard`
- `GET /dashboard/beginner`
- `GET /dashboard/intermediate`
- `GET /dashboard/expert`

Level is a presentation preference, not a permission role.

## Farmer resources (owner-scoped CRUD)
Each resource supports `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `PATCH /{id}`, `DELETE /{id}`:
- `/farms`
- `/crops`
- `/tasks`
- `/expenses`
- `/inventory`
- `/soil` (frontend `/soil-irrigation` is normalized to this path)
- `/harvests`
- `/market/watchlist`
- `/learning/progress`
- `/community/posts`
- `/experts/questions`
- `/disease/reports`
- `/assistant/conversations`
- `/schemes/saved`
- `/marketplace/listings`
- `/notifications`

POST/PUT/PATCH body: a JSON object with the resource fields. List endpoints accept `limit` (1–500) and `offset`.

## Weather and market data
- `GET /weather?city=Hyderabad` — current weather; needs `OPENWEATHER_API_KEY`.
- `GET /market/prices?crop=Rice&market=...&state=...` — needs `MARKET_PRICE_API_URL` and optional key.
- `/market/watchlist` — per-user CRUD.

## Learning
- `GET /learning/resources?level=beginner&topic=soil` — published curated resources.
- `/learning/progress` — per-user progress CRUD.

## Community
- `/community/posts` — post CRUD
- `GET /community/posts/{post_id}/comments`
- `POST /community/posts/{post_id}/comments` — `{content}`
- `POST /community/posts/{post_id}/like` — toggle current user's like

## Expert services
- `/experts/questions` — submit/list questions
- `POST /experts/questions/{question_id}/answer` — expert/admin only; `{answer}`

## AI and crop health
- `/assistant/ask` — `{question}`; requires `OPENAI_API_KEY`
- `/disease/crops` — reports no validated model until one is configured
- `/disease/detect` — returns 503 until a validated model is connected
- `/disease/reports` — save/list issue reports

## Government schemes and marketplace
- `GET /schemes?state=...&crop=...&category=...` — published curated schemes
- `/schemes/saved` — per-user saved schemes
- `GET /marketplace?category=...&search=...` — active listings
- `/marketplace/listings` — listing CRUD

## Reports and notifications
- `GET /reports/summary?farm_id=...` — counts, expense/revenue and net profit from user's records
- `/notifications` — per-user notification CRUD
- `POST /notifications/read-all` — mark all current user's notifications read

## Error conventions
FastAPI validation errors use HTTP 422. Authentication errors use 401, ownership-safe missing records use 404, permission errors use 403, missing external configuration uses 503, and upstream provider failures use 502.
