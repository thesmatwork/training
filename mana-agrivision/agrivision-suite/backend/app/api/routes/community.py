from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.services.resources import list_owned, create_owned

router = APIRouter(prefix="/community/posts", tags=["Community"])
comments = APIRouter(prefix="/community/posts", tags=["Community"])


@router.get("")
def list_posts(user=Depends(get_current_user)):
    return list_owned("app_records", user["user_id"], fixed_filters={"category": "community", "kind": "post"})


@router.post("", status_code=201)
def create_post(payload: dict, user=Depends(get_current_user)):
    return create_owned("app_records", user["user_id"], payload, {"category": "community", "kind": "post"})


@comments.get("/{post_id}/comments")
def list_comments(post_id: str, user=Depends(get_current_user)):
    rows = (get_db().table("app_records").select("*")
            .eq("category", "community").eq("kind", "comment")
            .contains("data", {"post_id": post_id})
            .order("created_at").execute().data or [])
    return rows


@comments.post("/{post_id}/comments", status_code=201)
def add_comment(post_id: str, payload: dict, user=Depends(get_current_user)):
    content = str(payload.get("content", "")).strip()
    if not content:
        raise HTTPException(status_code=422, detail="Comment content is required")
    return create_owned("app_records", user["user_id"],
                        {"post_id": post_id, "content": content},
                        {"category": "community", "kind": "comment"})


@comments.post("/{post_id}/like")
def toggle_like(post_id: str, user=Depends(get_current_user)):
    db = get_db()
    rows = (db.table("app_records").select("*")
            .eq("owner_id", user["user_id"])
            .eq("category", "community").eq("kind", "like")
            .contains("data", {"post_id": post_id}).execute().data or [])
    if rows:
        db.table("app_records").delete().eq("id", rows[0]["id"]).eq("owner_id", user["user_id"]).execute()
        return {"liked": False}
    create_owned("app_records", user["user_id"], {"post_id": post_id},
                 {"category": "community", "kind": "like"})
    return {"liked": True}
