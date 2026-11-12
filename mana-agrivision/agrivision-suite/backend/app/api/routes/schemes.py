from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/schemes/saved", "saved_schemes", "Saved Government Schemes")
catalog = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@catalog.get("")
def list_schemes(state: str | None = None, crop: str | None = None, category: str | None = None, user=Depends(get_current_user)):
    q=get_db().table("government_schemes").select("*").eq("published",True)
    if state: q=q.or_(f"state.eq.{state},state.eq.All India")
    if crop: q=q.contains("crops",[crop])
    if category: q=q.eq("category",category)
    return q.order("last_verified_at",desc=True).execute().data or []
