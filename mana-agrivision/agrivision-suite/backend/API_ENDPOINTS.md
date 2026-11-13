# Mana Agrivision API endpoint map

Base URL: `http://127.0.0.1:8000/api/v1`

Protected endpoints require `Authorization: Bearer <access_token>`. JSON writes use `Content-Type: application/json`.

## Connected to existing Supabase tables

| Frontend area | API endpoints | Supabase table | Scope / discriminator |
|---|---|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/me` | `app_users` | `user_id` |
| Dashboard | `GET /dashboard`, `GET /dashboard/{beginner\|intermediate\|expert}` | Existing tables | Counts scoped by `owner_id` |
| Farms | `GET/POST /farms`, `GET/PUT/PATCH/DELETE /farms/{id}` | `farms` | `owner_id` |
| Crops | `GET/POST /crops`, `GET/PUT/PATCH/DELETE /crops/{id}` | `app_records` | `category=crop`, `kind=crop` |
| Tasks | `GET/POST /tasks`, `GET/PUT/PATCH/DELETE /tasks/{id}` | `farm_management` | `record_type=task` |
| Harvests | `GET/POST /harvests`, `GET/PUT/PATCH/DELETE /harvests/{id}` | `farm_management` | `record_type=harvest` |
| Expenses | `GET/POST /expenses`, `GET/PUT/PATCH/DELETE /expenses/{id}` | `farm_resources` | `resource_type=expense` |
| Inventory | `GET/POST /inventory`, `GET/PUT/PATCH/DELETE /inventory/{id}` | `farm_resources` | `resource_type=inventory` |
| Soil & irrigation | `GET/POST /soil`, `GET/PUT/PATCH/DELETE /soil/{id}` | `app_records` | `category=soil`, `kind=soil_irrigation` |
| Market watchlist | `GET/POST /market/watchlist`, `GET/PUT/PATCH/DELETE /market/watchlist/{id}` | `app_records` | `category=market_watchlist`, `kind=market_watchlist` |
| Market prices | `GET /market/prices?crop=...&market=...&state=...` | `market_data` fallback; external provider optional | Current user's rows when no provider configured |
| Learning progress | `GET/POST /learning/progress`, `GET/PUT/PATCH/DELETE /learning/progress/{id}` | `learning` | `record_type=progress` |
| Learning resources | `GET /learning/resources` | `learning` | `record_type=resource` |
| AI assistant | `GET/POST /assistant/conversations`, `POST /assistant/ask` | `ai_assistant` | `owner_id`; AI answer requires `OPENAI_API_KEY` |
| Community posts | `GET/POST /community/posts` | `app_records` | `category=community`, `kind=post` |
| Community comments | `GET/POST /community/posts/{post_id}/comments` | `app_records` | `category=community`, `kind=comment` |
| Community likes | `POST /community/posts/{post_id}/like` | `app_records` | `category=community`, `kind=like` |
| Expert questions | `GET/POST /experts/questions`, `POST /experts/questions/{id}/answer` | `app_records` | `category=expert`, `kind=question` |
| Disease reports | `GET/POST /disease/reports`, `GET /disease/crops`, `POST /disease/detect` | `app_records` for reports | Detection returns 503 until a validated model is configured |
| Saved schemes | `GET/POST /schemes/saved`, `GET /schemes` | `app_records` for saved items | Public scheme catalogue is not in the supplied schema |
| Marketplace listings | `GET/POST /marketplace/listings`, `GET /marketplace` | `app_records` | `category=marketplace`, `kind=listing` |
| Notifications | `GET/POST /notifications`, `POST /notifications/read-all` | `app_records` | `category=notification`, `kind=in_app` |
| Reports | `GET /reports/summary` | `farms`, `app_records`, `farm_management`, `farm_resources` | Current user's rows |

## Important data notes

- The backend uses the Supabase service-role key only on the server. Never expose it in Vite or browser code.
- The supplied schema has `owner_id` on user-owned resource tables; `app_users` uses `user_id`.
- `app_records` has BIGINT `created_at` / `updated_at` columns and required `category`, `pk`, and `sk` fields. New records are assigned a `USER#<user_id>` partition key and a unique `<KIND>#<uuid>` sort key. Confirm this key convention against your legacy records before production migration.
- `farm_resources` is shared by inventory and expenses. The `resource_type` discriminator keeps the two feature areas separate.
- No database table was confirmed for the public schemes catalogue, SMS/OTP, Google token verification, or crop disease model. Those provider-backed functions are not represented as working integrations.
- No schema is created, dropped, or altered by this code.
