from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.db.supabase import get_db
from app.api.routes.resource_factory import build_router

router = build_router("/community/posts", "community_posts", "Community")
comments = APIRouter(prefix="/community/posts", tags=["Community"])

@comments.get("/{post_id}/comments")
def list_comments(post_id: str, user=Depends(get_current_user)):
    get_db().table("community_posts").select("id").eq("id", post_id).execute()
    return get_db().table("community_comments").select("*").eq("post_id", post_id).order("created_at").execute().data or []

@comments.post("/{post_id}/comments", status_code=201)
def add_comment(post_id: str, payload: dict, user=Depends(get_current_user)):
    post = get_db().table("community_posts").select("id").eq("id", post_id).maybe_single().execute().data
    if not post: raise HTTPException(status_code=404, detail="Post not found")
    return get_db().table("community_comments").insert({"post_id":post_id,"user_id":user["user_id"],"content":payload.get("content","")}).execute().data[0]

@comments.post("/{post_id}/like")
def toggle_like(post_id: str, user=Depends(get_current_user)):
    db=get_db()
    existing=db.table("community_likes").select("id").eq("post_id",post_id).eq("user_id",user["user_id"]).maybe_single().execute().data
    if existing:
        db.table("community_likes").delete().eq("id",existing["id"]).execute()
        return {"liked":False}
    db.table("community_likes").insert({"post_id":post_id,"user_id":user["user_id"]}).execute()
    return {"liked":True}
