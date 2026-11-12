from functools import lru_cache
from supabase import create_client, Client
from app.core.config import settings

@lru_cache
def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env."
        )
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )

def get_db():
    return get_supabase()