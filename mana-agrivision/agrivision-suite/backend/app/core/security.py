
import logging
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.db.supabase import get_db


# Logger
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# JWT configuration
bearer = HTTPBearer(auto_error=False)
ALGORITHM = "HS256"


# --------------------------------------------------
# PASSWORD HASHING
# --------------------------------------------------

def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")

    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    if not password or not hashed:
        return False

    try:
        return pwd_context.verify(password, hashed)

    except (UnknownHashError, ValueError, TypeError):
        logger.warning("Password verification failed: invalid password hash")
        return False

    except Exception:
        logger.exception("Unexpected password verification error")
        return False


# --------------------------------------------------
# JWT TOKEN GENERATION
# --------------------------------------------------

def create_access_token(subject: str) -> str:
    if not settings.secret_key:
        raise HTTPException(status_code=503, detail="SECRET_KEY is not configured in backend/.env")

    if not subject:
        raise ValueError("User ID cannot be empty")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": str(subject),
        "exp": expire
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=ALGORITHM
    )


# --------------------------------------------------
# GET CURRENT AUTHENTICATED USER
# --------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
):
    # Check authorization header
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    # Verify JWT token
    if not settings.secret_key:
        raise HTTPException(status_code=503, detail="SECRET_KEY is not configured")

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise ValueError("Missing user ID in token")

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    # Verify user in Supabase
    try:
        db = get_db()

        result = (
            db.table("app_users")
            .select("*")
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )

        user = result.data[0] if result.data else None

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found",
            )

        return user

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Supabase user verification failed for user_id=%s",
            user_id
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify user account. Check database configuration.",
        )
