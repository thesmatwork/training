from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.services.resources import list_owned, create_owned, update_owned

router = APIRouter(prefix="/experts/questions", tags=["Expert Services"])
answer_router = APIRouter(prefix="/experts/questions", tags=["Expert Services"])


@router.get("")
def list_questions(user=Depends(get_current_user)):
    return list_owned("app_records", user["user_id"], fixed_filters={"category": "expert", "kind": "question"})


@router.post("", status_code=201)
def create_question(payload: dict, user=Depends(get_current_user)):
    return create_owned("app_records", user["user_id"], payload,
                        {"category": "expert", "kind": "question"})


@answer_router.post("/{question_id}/answer")
def answer_question(question_id: str, payload: dict, user=Depends(get_current_user)):
    if user.get("role") not in {"expert", "admin"}:
        raise HTTPException(status_code=403, detail="Expert or administrator access required")
    db = get_db()
    row = (db.table("app_records").select("*").eq("id", question_id)
           .eq("category", "expert").eq("kind", "question").maybe_single().execute().data)
    if not row:
        raise HTTPException(status_code=404, detail="Question not found")
    data = dict(row.get("data") or {})
    data.update({"answer": payload.get("answer"), "status": "answered", "answered_by": user["user_id"]})
    updated = db.table("app_records").update({"data": data}).eq("id", question_id).execute().data
    return updated[0] if updated else row
