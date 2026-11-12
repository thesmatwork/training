import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_user
from app.core.config import settings
from app.api.routes.resource_factory import build_router

router = APIRouter(prefix="/market", tags=["Market Prices"])
watch_router = build_router("/market/watchlist", "market_watchlist", "Market Watchlist")

@router.get("/prices")
def market_prices(crop: str = Query(...), market: str | None = None, state: str | None = None, user=Depends(get_current_user)):
    if not settings.market_price_api_url:
        raise HTTPException(status_code=503, detail="Market price provider is not configured. Configure MARKET_PRICE_API_URL and its credentials.")
    try:
        headers = {"Authorization": f"Bearer {settings.market_price_api_key}"} if settings.market_price_api_key else {}
        response = httpx.get(settings.market_price_api_url, params={"crop": crop, "market": market, "state": state}, headers=headers, timeout=15)
        response.raise_for_status()
        return {"items": response.json(), "source": "Configured market provider"}
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Market price provider request failed")
