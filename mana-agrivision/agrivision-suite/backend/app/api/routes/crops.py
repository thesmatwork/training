from app.api.routes.resource_factory import build_router
router = build_router("/crops", "app_records", "Crops", {"category": "crop", "kind": "crop"})
