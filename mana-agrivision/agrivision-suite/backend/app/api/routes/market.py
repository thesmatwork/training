import json
import time
import urllib.error
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user
from app.core.config import settings
from app.api.routes.resource_factory import build_router
from app.db.supabase import get_db


# =====================================================
# ROUTERS
# =====================================================

router = APIRouter(
    prefix="/market",
    tags=["Market Prices"]
)

watch_router = build_router(
    "/market/watchlist",
    "app_records",
    "Market Watchlist",
    {
        "category": "market_watchlist",
        "kind": "market_watchlist"
    }
)


# =====================================================
# DATA.GOV.IN API HELPER
# Uses urllib because curl.exe and urllib succeed in this
# environment, while httpx receives a blank HTTP 502.
# =====================================================

def fetch_data_gov_prices(params: dict):
    api_url = (settings.market_price_api_url or "").strip()
    api_key = (settings.market_price_api_key or "").strip()

    if not api_url or not api_key:
        raise HTTPException(
            status_code=503,
            detail="Market API URL or API key is not configured."
        )

    request_params = params.copy()
    request_params["api-key"] = api_key

    query_string = urllib.parse.urlencode(request_params)
    separator = "&" if "?" in api_url else "?"
    request_url = f"{api_url}{separator}{query_string}"

    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            print(
                f"DATA.GOV REQUEST: attempt "
                f"{attempt + 1}/{max_attempts}"
            )

            request = urllib.request.Request(
                request_url,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json"
                },
                method="GET"
            )

            with urllib.request.urlopen(request, timeout=120) as response:
                status_code = response.status
                response_body = response.read()

            print("DATA.GOV HTTP STATUS:", status_code)

            if not response_body:
                raise HTTPException(
                    status_code=502,
                    detail="data.gov.in returned an empty response."
                )

            try:
                result = json.loads(response_body.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                print(
                    "DATA.GOV INVALID JSON:",
                    response_body[:1000].decode("utf-8", errors="replace")
                )
                raise HTTPException(
                    status_code=502,
                    detail="data.gov.in returned invalid JSON."
                )

            if not isinstance(result, dict):
                raise HTTPException(
                    status_code=502,
                    detail="Unexpected response format from data.gov.in."
                )

            # Provider error can also arrive with HTTP 200.
            if result.get("error"):
                provider_error = str(result["error"])
                print("DATA.GOV PROVIDER ERROR:", provider_error)

                if "rate limit" in provider_error.lower():
                    raise HTTPException(
                        status_code=429,
                        detail="data.gov.in rate limit exceeded."
                    )

                raise HTTPException(
                    status_code=502,
                    detail=f"data.gov.in API error: {provider_error}"
                )

            records = result.get("records", [])

            if not isinstance(records, list):
                raise HTTPException(
                    status_code=502,
                    detail="Invalid records format from data.gov.in."
                )

            try:
                total = int(result.get("total", len(records)))
            except (ValueError, TypeError):
                total = len(records)

            print("DATA.GOV RECORD COUNT:", len(records))
            print("DATA.GOV TOTAL:", total)

            return records, total

        except HTTPException:
            raise

        except urllib.error.HTTPError as error:
            status_code = error.code
            error_body = error.read().decode("utf-8", errors="replace")

            print(
                "DATA.GOV HTTP ERROR:",
                status_code,
                error_body[:1000]
            )

            if status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="data.gov.in rate limit exceeded. Try again later."
                )

            if status_code in (401, 403):
                raise HTTPException(
                    status_code=502,
                    detail="data.gov.in rejected the API key. Verify the active key."
                )

            if status_code in (500, 502, 503, 504):
                if attempt < max_attempts - 1:
                    time.sleep(2 * (attempt + 1))
                    continue

                raise HTTPException(
                    status_code=502,
                    detail=(
                        f"data.gov.in returned HTTP {status_code} "
                        "after retries."
                    )
                )

            raise HTTPException(
                status_code=502,
                detail=f"data.gov.in returned HTTP {status_code}."
            )

        except (TimeoutError, OSError, urllib.error.URLError) as error:
            print(
                "DATA.GOV CONNECTION ERROR:",
                type(error).__name__,
                str(error)
            )

            if attempt < max_attempts - 1:
                time.sleep(2)
                continue

            raise HTTPException(
                status_code=504 if isinstance(error, TimeoutError) else 502,
                detail="Unable to connect to data.gov.in or request timed out."
            )

    raise HTTPException(
        status_code=502,
        detail="Unable to fetch market prices."
    )


# =====================================================
# SUPABASE FALLBACK
# =====================================================

def fetch_supabase_market_prices(
    crop: str | None,
    market: str | None,
    state: str | None,
    limit: int,
    offset: int
):
    query = (
        get_db()
        .table("market_data")
        .select("*", count="exact")
    )

    if crop:
        query = query.ilike("crop_name", f"%{crop}%")

    if market:
        query = query.ilike("market_name", f"%{market}%")

    if state:
        query = query.ilike("state", f"%{state}%")

    result = (
        query
        .order("price_date", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    records = result.data or []
    total = result.count or 0

    return {
        "items": records,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + len(records) < total,
        "source": "Supabase market_data",
        "status": "success"
    }


# =====================================================
# MARKET PRICES API
# =====================================================

@router.get("/prices")
def market_prices(
    crop: str | None = Query(
        default=None,
        description="Optional crop or commodity name"
    ),
    market: str | None = Query(
        default=None,
        description="Optional market name"
    ),
    state: str | None = Query(
        default=None,
        description="Optional state name"
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=500
    ),
    offset: int = Query(
        default=0,
        ge=0
    ),
    user=Depends(get_current_user)
):
    # Normalize optional filters.
    crop = crop.strip() if crop and crop.strip() else None
    market = market.strip() if market and market.strip() else None
    state = state.strip() if state and state.strip() else None

    # =================================================
    # 1. LIVE DATA.GOV.IN API
    # =================================================

    if (
        settings.market_price_api_url
        and settings.market_price_api_key
    ):
        params = {
            "format": "json",
            "limit": limit,
            "offset": offset
        }

        if crop:
            params["filters[commodity]"] = crop

        if market:
            params["filters[market]"] = market

        if state:
            params["filters[state]"] = state

        try:
            records, total = fetch_data_gov_prices(params)

            return {
                "items": records,
                "total": total,
                "limit": limit,
                "offset": offset,
                "has_more": offset + len(records) < total,
                "source": "data.gov.in",
                "status": "success"
            }

        except HTTPException as api_error:
            # Do not hide rate-limit errors.
            if api_error.status_code == 429:
                raise api_error

            print("LIVE MARKET API FAILED:", api_error.detail)
            print("TRYING SUPABASE FALLBACK...")

            try:
                fallback_result = fetch_supabase_market_prices(
                    crop=crop,
                    market=market,
                    state=state,
                    limit=limit,
                    offset=offset
                )

                fallback_result["warning"] = (
                    "Live data.gov.in API is temporarily unavailable. "
                    "Showing saved Supabase market data."
                )

                return fallback_result

            except Exception as db_error:
                print("SUPABASE FALLBACK ERROR:", repr(db_error))

                raise HTTPException(
                    status_code=502,
                    detail={
                        "message": (
                            "Live market API and Supabase fallback both failed."
                        ),
                        "data_gov_error": str(api_error.detail),
                        "fallback_error": str(db_error)
                    }
                )

    # =================================================
    # 2. SUPABASE ONLY
    # =================================================

    print(
        "DATA.GOV CONFIGURATION MISSING. "
        "USING SUPABASE MARKET DATA."
    )

    try:
        return fetch_supabase_market_prices(
            crop=crop,
            market=market,
            state=state,
            limit=limit,
            offset=offset
        )

    except Exception as error:
        print("SUPABASE MARKET ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch market prices from Supabase."
        )
