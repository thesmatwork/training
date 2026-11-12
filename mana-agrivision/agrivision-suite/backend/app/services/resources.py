from fastapi import HTTPException
from app.db.supabase import get_db

def _flatten(row):
    if not row: return row
    return {**(row.get("data") or {}), "id": row.get("id"), "user_id": row.get("user_id"),
            "created_at": row.get("created_at"), "updated_at": row.get("updated_at")}

def list_owned(table: str, user_id: str, filters: dict | None = None, limit: int = 100, offset: int = 0):
    q = get_db().table(table).select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1)
    rows=q.execute().data or []
    result=[_flatten(x) for x in rows]
    for key,value in (filters or {}).items():
        if value is not None: result=[x for x in result if str(x.get(key))==str(value)]
    return result

def create_owned(table: str, user_id: str, data: dict):
    row=get_db().table(table).insert({"user_id":user_id,"data":data}).execute().data[0]
    return _flatten(row)

def get_owned(table: str, user_id: str, item_id: str):
    result = get_db().table(table).select("*").eq("id", item_id).eq("user_id", user_id).maybe_single().execute()
    if not result.data: raise HTTPException(status_code=404, detail="Record not found")
    return _flatten(result.data)

def update_owned(table: str, user_id: str, item_id: str, data: dict):
    current=get_owned(table,user_id,item_id)
    merged={k:v for k,v in current.items() if k not in {"id","user_id","created_at","updated_at"}}
    merged.update(data)
    result=get_db().table(table).update({"data":merged}).eq("id", item_id).eq("user_id", user_id).execute()
    return _flatten(result.data[0]) if result.data else get_owned(table,user_id,item_id)

def delete_owned(table: str, user_id: str, item_id: str):
    get_owned(table, user_id, item_id)
    get_db().table(table).delete().eq("id", item_id).eq("user_id", user_id).execute()
