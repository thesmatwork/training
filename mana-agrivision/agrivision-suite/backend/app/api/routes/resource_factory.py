from fastapi import APIRouter, Body, Depends, Query
from app.core.security import get_current_user
from app.services.resources import (
    list_owned, create_owned, get_owned, update_owned, delete_owned,
)


def build_router(prefix: str, table: str, tag: str, extra_filters=None):
    fixed_filters = dict(extra_filters or {})
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("")
    def list_items(
        limit: int = Query(100, ge=1, le=500),
        offset: int = Query(0, ge=0),
        user=Depends(get_current_user),
    ):
        return list_owned(
            table, user["user_id"], limit=limit, offset=offset,
            fixed_filters=fixed_filters,
        )

    @router.post("", status_code=201)
    def create_item(
        payload: dict = Body(...),
        user=Depends(get_current_user),
    ):
        return create_owned(table, user["user_id"], payload, fixed_filters)

    @router.get("/{item_id}")
    def read_item(item_id: str, user=Depends(get_current_user)):
        return get_owned(table, user["user_id"], item_id, fixed_filters)

    @router.put("/{item_id}")
    @router.patch("/{item_id}")
    def update_item(
        item_id: str,
        payload: dict = Body(...),
        user=Depends(get_current_user),
    ):
        return update_owned(table, user["user_id"], item_id, payload, fixed_filters)

    @router.delete("/{item_id}", status_code=204)
    def remove_item(item_id: str, user=Depends(get_current_user)):
        delete_owned(table, user["user_id"], item_id, fixed_filters)
        return None

    return router
