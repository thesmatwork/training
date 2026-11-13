import httpx
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.config import settings
from app.db.supabase import get_db

router = APIRouter(prefix="/assistant/conversations", tags=["AI Farming Assistant"])
ask_router = APIRouter(prefix="/assistant", tags=["AI Farming Assistant"])


@router.get("")
def list_conversations(user=Depends(get_current_user)):
    rows = (get_db().table("ai_assistant").select("*")
            .eq("owner_id", user["user_id"])
            .order("created_at", desc=True).execute().data or [])
    return rows


@router.post("", status_code=201)
def create_conversation(payload: dict, user=Depends(get_current_user)):
    row = {
        "owner_id": user["user_id"],
        "conversation_id": payload.get("conversation_id"),
        "record_type": "conversation",
        "role": "system",
        "content": payload.get("title", "New conversation"),
        "data": payload,
    }
    result = get_db().table("ai_assistant").insert(row).execute()
    return result.data[0] if result.data else {}


@ask_router.post("/ask")
def ask(payload: dict, user=Depends(get_current_user)):
    question = str(payload.get("question", "")).strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question is required")
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI provider is not configured. Set OPENAI_API_KEY.")
    try:
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
            json={"model": "gpt-4o-mini", "messages": [
                {"role": "system", "content": "You are a cautious agricultural information assistant. State uncertainty and recommend local agricultural experts for high-risk decisions. Never invent pesticide doses."},
                {"role": "user", "content": question},
            ]},
            timeout=30,
        )
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"]
        saved = get_db().table("ai_assistant").insert({
            "owner_id": user["user_id"],
            "conversation_id": payload.get("conversation_id"),
            "record_type": "message",
            "role": "assistant",
            "content": answer,
            "data": {"question": question},
        }).execute().data
        return {"answer": answer, "record": saved[0] if saved else None}
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="AI provider request failed") from exc
