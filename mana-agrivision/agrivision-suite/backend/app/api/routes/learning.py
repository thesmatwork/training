from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/learning/progress", "learning", "Learning Progress", {"record_type": "progress"})
catalog = APIRouter(prefix="/learning", tags=["Learning Resources"])

@catalog.get("/resources")
def resources(level: str | None = None, topic: str | None = None, user=Depends(get_current_user)):
    rows = (get_db().table("learning").select("*")
            .eq("record_type", "resource")
            .order("created_at", desc=True).execute().data or [])
    if level:
        rows = [row for row in rows if (row.get("data") or {}).get("level") == level]
    if topic:
        rows = [row for row in rows if (row.get("data") or {}).get("topic") == topic]
    return rows
