from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db

router = APIRouter(prefix="/reports", tags=["Reports and Analytics"])


def rows(table, user_id, filters=None, farm_id=None):
    query = get_db().table(table).select("*").eq("owner_id", user_id)
    for key, value in (filters or {}).items():
        query = query.eq(key, value)
    if farm_id and table in {"farm_management", "farm_resources"}:
        query = query.eq("farm_id", farm_id)
    return query.execute().data or []


@router.get("/summary")
def summary(farm_id: str | None = None, user=Depends(get_current_user)):
    uid = user["user_id"]
    farms = rows("farms", uid)
    crops = rows("app_records", uid, {"category": "crop", "kind": "crop"})
    tasks = rows("farm_management", uid, {"record_type": "task"}, farm_id)
    harvests = rows("farm_management", uid, {"record_type": "harvest"}, farm_id)
    expenses = rows("farm_resources", uid, {"resource_type": "expense"}, farm_id)

    def data(row):
        return row.get("data") or {}

    total_expenses = sum(float(row.get("amount") or data(row).get("amount") or 0) for row in expenses)
    revenue = sum(float(data(row).get("revenue") or data(row).get("total_amount") or 0) for row in harvests)
    return {
        "farm_count": len(farms),
        "crop_count": len(crops),
        "task_count": len(tasks),
        "expense_count": len(expenses),
        "harvest_count": len(harvests),
        "total_expenses": total_expenses,
        "total_revenue": revenue,
        "net_profit": revenue - total_expenses,
        "currency": "INR",
        "note": "Calculated from records saved by this account.",
    }
