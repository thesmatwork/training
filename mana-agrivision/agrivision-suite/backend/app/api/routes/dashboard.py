from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])

TABLES = ["farms", "crops", "tasks", "expenses", "inventory", "harvests", "soil_records",
          "community_posts", "expert_questions", "disease_reports", "market_watchlist", "notifications"]

def summary(user):
    db = get_db()
    counts = {}
    for table in TABLES:
        try:
            r = db.table(table).select("id", count="exact").eq("user_id", user["id"]).execute()
            counts[table] = r.count or 0
        except Exception:
            counts[table] = 0
    return {"user": {k:v for k,v in user.items() if k != "password_hash"},
            "level": user.get("level", "beginner"), "counts": counts}

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
