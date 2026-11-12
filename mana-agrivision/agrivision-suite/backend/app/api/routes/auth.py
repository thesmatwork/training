
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from app.db.supabase import get_db
from app.schemas import RegisterIn, LoginIn, ProfileUpdate
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

USER_TABLE = "app_users"


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def find_user_by_email(email: str):
    result = (
        get_db()
        .table(USER_TABLE)
        .select("*")
        .eq("email", email.lower().strip())
        .limit(1)
        .execute()
    )

    return result.data[0] if result.data else None


def public_user(user: dict):
    safe_user = dict(user)

    for field in (
        "password_hash",
        "hashed_password",
        "password",
    ):
        safe_user.pop(field, None)

    return safe_user


def get_user_id(user: dict) -> str:
    user_id = user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=500,
            detail="User record is missing user_id",
        )

    return str(user_id)


def log_database_error(exc: APIError):
    print("\n========== SUPABASE DATABASE ERROR ==========")
    print("ERROR TYPE:", type(exc).__name__)
    print("ERROR CODE:", getattr(exc, "code", None))
    print("ERROR MESSAGE:", getattr(exc, "message", None))
    print("ERROR DETAILS:", getattr(exc, "details", None))
    print("ERROR HINT:", getattr(exc, "hint", None))
    print("FULL ERROR:", repr(exc))
    print("=============================================\n")


# ==================================================
# REGISTER
# ==================================================

@router.post("/register", status_code=201)
def register(payload: RegisterIn):

    db = get_db()
    email = payload.email.lower().strip()

    if payload.level not in {
        "beginner",
        "intermediate",
        "expert",
    }:
        raise HTTPException(
            status_code=422,
            detail="Level must be beginner, intermediate or expert",
        )

    try:
        # Check existing account
        existing_user = find_user_by_email(email)

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists",
            )

        user_id = str(uuid4())

        # Prepare new user record
        row = {
            "pk": user_id,
            "sk": "PROFILE",
            "user_id": user_id,
            "name": payload.name,
            "email": email,
            "password_hash": hash_password(payload.password),
            "level": payload.level,
            "role": "farmer",
        }

        phone = getattr(payload, "phone", None)
        state = getattr(payload, "state", None)

        if phone:
            row["phone"] = phone

        if state:
            row["state"] = state

        # Insert user into Supabase
        result = (
            db.table(USER_TABLE)
            .insert(row)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Registration returned no user data",
            )

        user = result.data[0]

        token = create_access_token(
            get_user_id(user)
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": public_user(user),
        }

    except HTTPException:
        raise

    except APIError as exc:
        log_database_error(exc)

        raise HTTPException(
            status_code=400,
            detail="Registration failed. Check backend terminal for database error.",
        ) from exc

    except Exception as exc:
        print("\nUNEXPECTED REGISTRATION ERROR:", repr(exc))

        raise HTTPException(
            status_code=500,
            detail="Unexpected registration error. Check backend terminal.",
        ) from exc


# ==================================================
# LOGIN
# ==================================================

@router.post("/login")
def login(payload: LoginIn):

    email = payload.email.lower().strip()

    try:
        user = find_user_by_email(email)

    except APIError as exc:
        log_database_error(exc)

        raise HTTPException(
            status_code=500,
            detail="Unable to read user account from Supabase",
        ) from exc

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    stored_hash = (
        user.get("password_hash")
        or user.get("hashed_password")
        or ""
    )

    if not stored_hash or not verify_password(
        payload.password,
        stored_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        get_user_id(user)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": public_user(user),
    }


# ==================================================
# LOGOUT
# ==================================================

@router.post("/logout")
def logout(user=Depends(get_current_user)):

    return {
        "message": "Logged out. Please clear the client session."
    }


# ==================================================
# GET CURRENT USER
# ==================================================

@router.get("/me")
def me(user=Depends(get_current_user)):

    return public_user(user)


# ==================================================
# UPDATE PROFILE
# ==================================================

@router.patch("/me")
def update_me(
    payload: ProfileUpdate,
    user=Depends(get_current_user),
):

    data = payload.model_dump(exclude_unset=True)

    if "level" in data and data["level"] not in {
        "beginner",
        "intermediate",
        "expert",
    }:
        raise HTTPException(
            status_code=422,
            detail="Invalid dashboard level",
        )

    allowed_fields = {
        "name",
        "level",
        "phone",
        "state",
    }

    data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not data:
        return public_user(user)

    try:
        result = (
            get_db()
            .table(USER_TABLE)
            .update(data)
            .eq("user_id", get_user_id(user))
            .execute()
        )

        updated = (
            result.data[0]
            if result.data
            else {**user, **data}
        )

        return public_user(updated)

    except APIError as exc:
        log_database_error(exc)

        raise HTTPException(
            status_code=400,
            detail="Unable to update user profile",
        ) from exc


# ==================================================
# GOOGLE LOGIN
# ==================================================

@router.post("/google")
def google_login(payload: dict):

    from app.core.config import settings

    if not settings.google_client_id:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured.",
        )

    raise HTTPException(
        status_code=501,
        detail="Google token verification provider is not installed.",
    )


# ==================================================
# OTP REQUEST
# ==================================================

@router.post("/otp/request")
def request_otp(payload: dict):

    from app.core.config import settings

    if (
        not settings.sms_provider_url
        or not settings.sms_provider_token
    ):
        raise HTTPException(
            status_code=503,
            detail="SMS/OTP provider is not configured.",
        )

    raise HTTPException(
        status_code=501,
        detail="SMS provider adapter is not installed.",
    )


# ==================================================
# OTP VERIFY
# ==================================================

@router.post("/otp/verify")
def verify_otp(payload: dict):

    raise HTTPException(
        status_code=503,
        detail="OTP verification is not configured.",
    )
