from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, dashboard, farms, crops, tasks, expenses, inventory, soil, harvests
from app.api.routes import weather, market, learning, community, experts, assistant, disease, schemes, marketplace, reports, notifications

app = FastAPI(title=settings.app_name, version="1.0.0", description="REST API for Mana Agrivision")

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health", tags=["Health"])
def health():
    return {"status":"ok","service":"mana-agrivision-api","database":"configured" if (settings.supabase_url and settings.supabase_service_role_key) else "not_configured"}



@app.get("/health/db", tags=["Health"])
def database_health():
    from fastapi import HTTPException
    from app.db.supabase import get_db
    try:
        get_db().table("app_users").select("user_id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        print(f"Supabase health check failed: {exc}")
        raise HTTPException(status_code=503, detail="Supabase connection failed")

@app.get("/", tags=["Health"])
def root():
    return {"message":"Mana Agrivision API","docs":"/docs","health":"/health"}

prefix=settings.api_v1_prefix
for module in [auth, dashboard, farms, crops, tasks, expenses, inventory, soil, harvests,
               weather, market, learning, community, experts, assistant, disease, schemes,
               marketplace, reports, notifications]:
    if hasattr(module,"router"): app.include_router(module.router,prefix=prefix)
    # Additional routers are mounted separately below.

for module in [market, learning, community, experts, assistant, disease, schemes, marketplace, notifications]:
    for name in ("watch_router","catalog","comments","ask_router","identify","answer_router","actions"):
        extra=getattr(module,name,None)
        if extra is not None: app.include_router(extra,prefix=prefix)
