import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from supabase import create_client, Client

load_dotenv(override=True)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("missing SUPABASE_URL or SUPABASE_KEY")

supabase: Client = create_client(supabase_url, supabase_key)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Auth models ----------

class PhoneAuthRequest(BaseModel):
    phone: str  # e.g. "+911234567890" - must include country code


class OtpVerifyRequest(BaseModel):
    phone: str
    token: str  # the OTP code the user received
    name: Optional[str] = None  # only needed on first-time registration


# ---------- Profile models ----------

class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1)


# ---------- Task models ----------

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: Optional[str] = "pending"


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[str] = None


# ---------- Auth dependency ----------

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

    if user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"user": user_response.user, "token": token}


def get_supabase_for_user(token: str) -> Client:
    client = create_client(supabase_url, supabase_key)
    client.postgrest.auth(token)
    return client


# ---------- Root ----------

@app.get("/")
def home():
    return {"message": "fastapi is working"}


# ---------- Auth routes ----------

@app.post("/send-otp")
def send_otp(request: PhoneAuthRequest):
    try:
        supabase.auth.sign_in_with_otp({
            "phone": request.phone,
            "options": {
                "channel": "sms",
            },
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to send OTP: {str(e)}")

    return {"message": f"OTP sent to {request.phone}"}


@app.post("/verify-otp")
def verify_otp(request: OtpVerifyRequest):
    try:
        response = supabase.auth.verify_otp({
            "phone": request.phone,
            "token": request.token,
            "type": "sms",
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"OTP verification failed: {str(e)}")

    if response.session is None:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    user = response.user
    token = response.session.access_token
    user_supabase = get_supabase_for_user(token)

    # If a name was provided, update it (profile already auto-created by the trigger)
    if request.name:
        user_supabase.table("profiles").update({"name": request.name}).eq("id", user.id).execute()


    profile = user_supabase.table("profiles").select("*").eq("id", user.id).execute()
    name_to_return = profile.data[0]["name"] if profile.data else "New User"

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user_id": user.id,
        "phone": user.phone,
        "name": name_to_return,
    }

# ---------- Profile routes ----------

@app.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])
    response = user_supabase.table("profiles").select("*").eq("id", current_user["user"].id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return response.data[0]


@app.put("/profile")
def update_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])
    try:
        response = (
            user_supabase.table("profiles")
            .update({"name": profile.name})
            .eq("id", current_user["user"].id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

    return response.data[0]


# ---------- Task routes (protected, scoped to logged-in user) ----------

@app.get("/tasks")
def get_tasks(current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])
    try:
        response = user_supabase.table("tasks").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")


@app.get("/tasks/{task_id}")
def get_task(task_id: int, current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])
    try:
        response = user_supabase.table("tasks").select("*").eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not response.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    return response.data[0]


@app.post("/tasks")
def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])
    task_data = task.model_dump()
    task_data["user_id"] = current_user["user"].id

    try:
        response = user_supabase.table("tasks").insert(task_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

    return response.data[0]


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate, current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])

    existing = user_supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    update_data = task.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    try:
        response = user_supabase.table("tasks").update(update_data).eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

    return response.data[0]


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: dict = Depends(get_current_user)):
    user_supabase = get_supabase_for_user(current_user["token"])

    existing = user_supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    try:
        user_supabase.table("tasks").delete().eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")

    return {"message": f"Task {task_id} deleted successfully"}