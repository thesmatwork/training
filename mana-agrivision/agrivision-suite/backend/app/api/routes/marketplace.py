from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/marketplace/listings", "app_records", "Marketplace Listings",
                      {"category": "marketplace", "kind": "listing"})
catalog = APIRouter(prefix="/marketplace", tags=["Marketplace"])


@catalog.get("")
def browse(category: str | None = None, search: str | None = None, user=Depends(get_current_user)):
    query = (get_db().table("app_records").select("*")
             .eq("category", "marketplace").eq("kind", "listing"))
    rows = query.order("created_at", desc=True).execute().data or []
    if category:
        rows = [x for x in rows if (x.get("data") or {}).get("category") == category]
    if search:
        needle = search.lower()
        rows = [x for x in rows if needle in str((x.get("data") or {}).get("title", "")).lower()]
    return rows
