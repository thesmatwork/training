from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.services.resources import get_owned, update_owned
from app.api.routes.resource_factory import build_router

router = build_router("/experts/questions", "expert_questions", "Expert Services")
answer_router = APIRouter(prefix="/experts/questions", tags=["Expert Services"])

@answer_router.post("/{question_id}/answer")
def answer_question(question_id: str, payload: dict, user=Depends(get_current_user)):
    if user.get("role") not in {"expert","admin"}:
        raise HTTPException(status_code=403, detail="Expert or administrator access required")
    current=get_owned("expert_questions", payload.get("farmer_id", user["id"]), question_id) if user.get("role")=="farmer" else None
    if current is None:
        from app.db.supabase import get_db
        row=get_db().table("expert_questions").select("*").eq("id",question_id).maybe_single().execute().data
        if not row: raise HTTPException(status_code=404, detail="Question not found")
        current={**(row.get("data") or {}),"id":row["id"],"user_id":row["user_id"]}
        merged={k:v for k,v in current.items() if k not in {"id","user_id"}}
        merged.update({"answer":payload.get("answer"),"status":"answered","answered_by":user["id"]})
        updated=get_db().table("expert_questions").update({"data":merged}).eq("id",question_id).execute().data[0]
        return {**updated.get("data",{}),"id":updated["id"],"user_id":updated["user_id"]}
    return update_owned("expert_questions", current["user_id"], question_id, {"answer":payload.get("answer"),"status":"answered"})
