from app.api.routes.resource_factory import build_router
router = build_router("/tasks", "farm_management", "Tasks", {"record_type": "task"})
