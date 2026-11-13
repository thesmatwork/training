from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mana Agrivision API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = ""
    access_token_expire_minutes: int = 60
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    openweather_api_key: str = ""
    weather_provider_url: str = "https://api.openweathermap.org/data/2.5/weather"
    market_price_api_url: str = ""
    market_price_api_key: str = ""
    openai_api_key: str = ""
    google_client_id: str = ""
    sms_provider_url: str = ""
    sms_provider_token: str = ""

    @property
    def cors_origin_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
