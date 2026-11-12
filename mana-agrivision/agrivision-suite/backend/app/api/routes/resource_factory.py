from fastapi import APIRouter, Depends, Query, Body
from app.core.security import get_current_user
from app.services.resources import list_owned, create_owned, get_owned, update_owned, delete_owned

def build_router(prefix: str, table: str, tag: str, extra_filters: tuple[str, ...] = ()):
    router = APIRouter(prefix=prefix, tags=[tag])
    @router.get("")
    def list_items(user=Depends(get_current_user), limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0)):
        # Query filters are handled explicitly by resource-specific modules where needed.
        return list_owned(table, user["id"], limit=limit, offset=offset)
    @router.post("", status_code=201)
    def create_item(payload: dict = Body(...), user=Depends(get_current_user)):
        return create_owned(table, user["id"], payload)
    @router.get("/{item_id}")
    def read_item(item_id: str, user=Depends(get_current_user)):
        return get_owned(table, user["id"], item_id)
    @router.put("/{item_id}")
    @router.patch("/{item_id}")
    def update_item(item_id: str, payload: dict = Body(...), user=Depends(get_current_user)):
        return update_owned(table, user["id"], item_id, payload)
    @router.delete("/{item_id}", status_code=204)
    def remove_item(item_id: str, user=Depends(get_current_user)):
        delete_owned(table, user["id"], item_id)
        return None
    return router
