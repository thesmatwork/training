from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings

def test_password_hash_roundtrip():
    hashed=hash_password("correct horse battery staple")
    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong password", hashed)

def test_access_token_contains_subject():
    token=create_access_token("user-123")
    payload=jwt.decode(token,settings.secret_key,algorithms=["HS256"])
    assert payload["sub"]=="user-123"
    assert payload["exp"] > int(datetime.now(timezone.utc).timestamp())
