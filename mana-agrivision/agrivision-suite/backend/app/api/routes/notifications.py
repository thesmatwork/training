from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/notifications", "notifications", "Notifications")
actions=APIRouter(prefix="/notifications",tags=["Notifications"])

@actions.post("/read-all")
def read_all(user=Depends(get_current_user)):
    get_db().table("notifications").update({"read":True}).eq("user_id",user["id"]).execute()
    return {"message":"Notifications marked as read"}
