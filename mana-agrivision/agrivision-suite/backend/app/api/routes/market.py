import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_user
from app.core.config import settings
from app.api.routes.resource_factory import build_router

router = APIRouter(prefix="/market", tags=["Market Prices"])
watch_router = build_router("/market/watchlist", "app_records", "Market Watchlist", {"category": "market_watchlist", "kind": "market_watchlist"})

@router.get("/prices")
def market_prices(crop: str = Query(...), market: str | None = None, state: str | None = None, user=Depends(get_current_user)):
    if not settings.market_price_api_url:
        # Fallback to market prices already stored in the existing Supabase table.
        from app.db.supabase import get_db
        query = get_db().table("market_data").select("*").eq("owner_id", user["user_id"]).ilike("crop_name", crop)
        if market:
            query = query.ilike("market_name", f"%{market}%")
        if state:
            query = query.ilike("state", f"%{state}%")
        rows = query.order("price_date", desc=True).limit(100).execute().data or []
        return {"items": rows, "source": "Supabase market_data"}
    try:
        headers = {"Authorization": f"Bearer {settings.market_price_api_key}"} if settings.market_price_api_key else {}
        response = httpx.get(settings.market_price_api_url, params={"crop": crop, "market": market, "state": state}, headers=headers, timeout=15)
        response.raise_for_status()
        return {"items": response.json(), "source": "Configured market provider"}
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Market price provider request failed")
