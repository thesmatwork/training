from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])


def _count(table: str, user_id: str, filters=None):
    query = get_db().table(table).select("id", count="exact").eq("owner_id", user_id)
    for key, value in (filters or {}).items():
        query = query.eq(key, value)
    response = query.limit(1).execute()
    return response.count or 0


def summary(user):
    uid = user["user_id"]
    counts = {
        "farms": _count("farms", uid),
        "crops": _count("app_records", uid, {"category": "crop", "kind": "crop"}),
        "tasks": _count("farm_management", uid, {"record_type": "task"}),
        "harvests": _count("farm_management", uid, {"record_type": "harvest"}),
        "expenses": _count("farm_resources", uid, {"resource_type": "expense"}),
        "inventory": _count("farm_resources", uid, {"resource_type": "inventory"}),
        "soil_records": _count("app_records", uid, {"category": "soil", "kind": "soil_irrigation"}),
        "learning": _count("learning", uid),
        "market_watchlist": _count("app_records", uid, {"category": "market_watchlist", "kind": "market_watchlist"}),
    }
    safe_user = {k: v for k, v in user.items() if k not in {"password_hash", "hashed_password", "password"}}
    return {"user": safe_user, "level": user.get("level", "beginner"), "counts": counts}


@router.get("")
def dashboard(user=Depends(get_current_user)):
    return summary(user)


@router.get("/{level}")
def level_dashboard(level: str, user=Depends(get_current_user)):
    if level not in {"beginner", "intermediate", "expert"}:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Dashboard level not found")
    data = summary(user)
    data["level"] = level
    return data
