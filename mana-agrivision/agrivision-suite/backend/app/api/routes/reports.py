from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.supabase import get_db

router=APIRouter(prefix="/reports",tags=["Reports and Analytics"])

@router.get("/summary")
def summary(farm_id: str | None = None, user=Depends(get_current_user)):
    db=get_db()
    def rows(table):
        q=db.table(table).select("*").eq("user_id",user["id"])
        if farm_id and table in {"crops","expenses","harvests","tasks"}: q=q.eq("farm_id",farm_id)
        return [{**(x.get("data") or {}), "id":x.get("id")} for x in (q.execute().data or [])]
    expenses=rows("expenses")
    harvests=rows("harvests")
    total_expenses=sum(float(x.get("amount") or 0) for x in expenses)
    revenue=sum(float(x.get("revenue") or x.get("total_amount") or 0) for x in harvests)
    return {"farm_count":len(rows("farms")),"crop_count":len(rows("crops")),
            "task_count":len(rows("tasks")),"expense_count":len(expenses),
            "harvest_count":len(harvests),"total_expenses":total_expenses,
            "total_revenue":revenue,"net_profit":revenue-total_expenses,
            "currency":"INR","note":"Calculated from records saved by this account."}
