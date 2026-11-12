from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/marketplace/listings", "marketplace_user_listings", "Marketplace")
catalog = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@catalog.get("")
def browse(category: str | None = None, search: str | None = None, user=Depends(get_current_user)):
    q=get_db().table("marketplace_listings").select("*").eq("active",True)
    if category: q=q.eq("category",category)
    if search: q=q.ilike("title",f"%{search}%")
    return q.order("created_at",desc=True).execute().data or []
