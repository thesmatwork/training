import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
def current_weather(city: str = Query(..., min_length=2), user=Depends(get_current_user)):
    if not settings.openweather_api_key:
        raise HTTPException(status_code=503, detail="Weather provider is not configured. Set OPENWEATHER_API_KEY in backend/.env.")
    try:
        response = httpx.get(settings.weather_provider_url, params={"q": city, "appid": settings.openweather_api_key, "units": "metric"}, timeout=12)
        response.raise_for_status()
        data = response.json()
        return {"city": city, "temperature": data.get("main", {}).get("temp"),
                "feels_like": data.get("main", {}).get("feels_like"),
                "humidity": data.get("main", {}).get("humidity"),
                "description": (data.get("weather") or [{}])[0].get("description"),
                "wind_speed": data.get("wind", {}).get("speed"), "source": "OpenWeather",
                "updated_at": data.get("dt")}
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Weather provider request failed")
