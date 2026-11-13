from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.services.resources import list_owned, create_owned

router = APIRouter(prefix="/notifications", tags=["Notifications"])
actions = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(user=Depends(get_current_user)):
    return list_owned("app_records", user["user_id"], fixed_filters={"category": "notification", "kind": "in_app"})


@router.post("", status_code=201)
def create_notification(payload: dict, user=Depends(get_current_user)):
    return create_owned("app_records", user["user_id"], payload,
                        {"category": "notification", "kind": "in_app"})


@actions.post("/read-all")
def read_all(user=Depends(get_current_user)):
    db = get_db()
    rows = (db.table("app_records").select("*").eq("owner_id", user["user_id"])
            .eq("category", "notification").eq("kind", "in_app").execute().data or [])
    for row in rows:
        data = dict(row.get("data") or {})
        data["read"] = True
        db.table("app_records").update({"data": data}).eq("id", row["id"]).eq("owner_id", user["user_id"]).execute()
    return {"message": "Notifications marked as read"}
