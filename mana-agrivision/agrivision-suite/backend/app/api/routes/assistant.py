import httpx
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.core.config import settings
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/assistant/conversations", "assistant_messages", "AI Farming Assistant")
ask_router = APIRouter(prefix="/assistant", tags=["AI Farming Assistant"])

@ask_router.post("/ask")
def ask(payload: dict, user=Depends(get_current_user)):
    question=str(payload.get("question","")).strip()
    if not question: raise HTTPException(status_code=422, detail="Question is required")
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI provider is not configured. Set OPENAI_API_KEY to enable AI answers. You can still use Learning and Ask an Expert.")
    try:
        response=httpx.post("https://api.openai.com/v1/chat/completions",
            headers={"Authorization":f"Bearer {settings.openai_api_key}","Content-Type":"application/json"},
            json={"model":"gpt-4o-mini","messages":[{"role":"system","content":"You are a cautious agricultural information assistant. State uncertainty and recommend local agricultural experts for high-risk decisions. Never invent pesticide doses."},{"role":"user","content":question}]},timeout=30)
        response.raise_for_status()
        answer=response.json()["choices"][0]["message"]["content"]
        saved=get_db().table("assistant_messages").insert({"user_id":user["user_id"],"data":{"question":question,"answer":answer}}).execute().data[0]
        return {**saved.get("data",{}),"id":saved["id"],"user_id":saved["user_id"],"created_at":saved["created_at"]}
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="AI provider request failed")
