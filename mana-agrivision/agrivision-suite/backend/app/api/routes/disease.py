from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.api.routes.resource_factory import build_router

router = build_router("/disease/reports", "disease_reports", "Crop Disease Detection")
identify = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])

@identify.get("/crops")
def supported_crops(user=Depends(get_current_user)):
    return {"items": [], "message": "No validated global crop/disease model is configured yet. Add a vetted model/provider before returning diagnoses."}

@identify.post("/detect")
def detect(payload: dict, user=Depends(get_current_user)):
    raise HTTPException(status_code=503, detail="Disease detection model is not configured. No diagnosis was generated. Submit the case to an agricultural expert.")
