from app.api.routes.resource_factory import build_router
router = build_router("/inventory", "farm_resources", "Inventory", {"resource_type": "inventory"})
