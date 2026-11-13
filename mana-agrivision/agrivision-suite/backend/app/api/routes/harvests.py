from app.api.routes.resource_factory import build_router
router = build_router("/harvests", "farm_management", "Harvest Records", {"record_type": "harvest"})
