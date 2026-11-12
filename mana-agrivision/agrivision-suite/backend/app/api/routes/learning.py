from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/learning/progress", "learning_progress", "Learning Progress")
catalog = APIRouter(prefix="/learning", tags=["Learning Resources"])

@catalog.get("/resources")
def resources(level: str | None = None, topic: str | None = None, user=Depends(get_current_user)):
    q=get_db().table("learning_resources").select("*").eq("published",True)
    if level: q=q.eq("level",level)
    if topic: q=q.eq("topic",topic)
    return q.order("created_at",desc=True).execute().data or []
