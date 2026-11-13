from app.api.routes.resource_factory import build_router
router = build_router("/expenses", "farm_resources", "Expenses", {"resource_type": "expense"})
