from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt, JWTError
import xmlrpc.client

app = FastAPI()

# Odoo connection
url = "http://localhost:8069"
db = "hackathon_db"
username = "nithyasri.m@thesmatwork.com"
password = "openpgpwd"

common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")

# JWT Config
SECRET_KEY = "supersecretkey"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# Request Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "internal", "portal", "public"

class UserLogin(BaseModel):
    email: str
    password: str

# Role mapping
ROLE_GROUPS = {
    "internal": ("base", "group_user"),
    "portal": ("base", "group_portal"),
    "public": ("base", "group_public"),
}

# JWT Utilities
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

# ✅ Register User API
@app.post("/api/register")
def register_user(user: UserRegister):
    group_key = ROLE_GROUPS.get(user.role.lower())
    if not group_key:
        raise HTTPException(status_code=400, detail="Invalid role. Use internal, portal, or public.")

    try:
        module, xml_id = group_key
        # ✅ Get group ID via search_read (works in Odoo 16)
        group_ref = models.execute_kw(
            db, uid, password,
            "ir.model.data", "search_read",
            [[["module", "=", module], ["name", "=", xml_id]]],
            {"fields": ["res_id"], "limit": 1}
        )
        if not group_ref:
            raise HTTPException(status_code=400, detail="Group not found")
        group_id = group_ref[0]["res_id"]

        # ✅ Create user in Odoo
        user_id = models.execute_kw(
            db, uid, password,
            "res.users", "create",
            [{
                "name": user.name,
                "login": user.email,
                "email": user.email,
                "password": user.password,
                "groups_id": [(6, 0, [group_id])]
            }]
        )

        return {"message": "User registered successfully", "user_id": user_id, "role": user.role}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

# ✅ Login API
@app.post("/api/login")
def login_user(user: UserLogin):
    try:
        login_uid = common.authenticate(db, user.email, user.password, {})
        if not login_uid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # ✅ Fetch user details
        user_data = models.execute_kw(
            db, uid, password,
            "res.users", "read",
            [login_uid],
            {"fields": ["id", "name", "login", "groups_id"]}
        )[0]

        # ✅ Create JWT token
        access_token = create_access_token(
            data={"sub": user_data["login"], "uid": user_data["id"]}
        )

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user_data["id"],
            "name": user_data["name"],
            "email": user_data["login"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

# ✅ Protected route
@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {"message": "Protected route", "user": current_user}
