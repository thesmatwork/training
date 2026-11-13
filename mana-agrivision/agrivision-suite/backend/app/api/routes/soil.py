from app.api.routes.resource_factory import build_router
router = build_router("/soil", "app_records", "Soil and Irrigation", {"category": "soil", "kind": "soil_irrigation"})
