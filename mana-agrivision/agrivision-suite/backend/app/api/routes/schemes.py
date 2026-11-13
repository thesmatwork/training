from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.resources import list_owned, create_owned

router = APIRouter(prefix="/schemes/saved", tags=["Saved Government Schemes"])
catalog = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get("")
def saved_schemes(user=Depends(get_current_user)):
    return list_owned("app_records", user["user_id"], fixed_filters={"category": "scheme", "kind": "saved"})


@router.post("", status_code=201)
def save_scheme(payload: dict, user=Depends(get_current_user)):
    return create_owned("app_records", user["user_id"], payload,
                        {"category": "scheme", "kind": "saved"})


@catalog.get("")
def list_schemes(state: str | None = None, crop: str | None = None,
                 category: str | None = None, user=Depends(get_current_user)):
    # The supplied Supabase schema has no verified public government-schemes catalogue table.
    return {"items": [], "message": "Government scheme catalogue is not connected yet; no unverified schemes are shown."}
