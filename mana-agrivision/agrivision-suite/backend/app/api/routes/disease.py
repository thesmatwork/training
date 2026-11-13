from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.services.resources import list_owned, create_owned

router = APIRouter(prefix="/disease/reports", tags=["Crop Disease Detection"])
identify = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])


@router.get("")
def list_reports(user=Depends(get_current_user)):
    return list_owned("app_records", user["user_id"], fixed_filters={"category": "disease", "kind": "report"})


@router.post("", status_code=201)
def create_report(payload: dict, user=Depends(get_current_user)):
    return create_owned("app_records", user["user_id"], payload,
                        {"category": "disease", "kind": "report"})


@identify.get("/crops")
def supported_crops(user=Depends(get_current_user)):
    return {"items": [], "message": "No validated crop disease model is configured."}


@identify.post("/detect")
def detect(payload: dict, user=Depends(get_current_user)):
    raise HTTPException(status_code=503, detail="Disease detection model is not configured. No diagnosis was generated.")
