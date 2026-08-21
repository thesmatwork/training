import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
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


# ---------- Pydantic models ----------

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: Optional[str] = "pending"


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[str] = None


# ---------- Routes ----------

@app.get("/")
def home():
    return {"message": "fastapi is working"}


@app.get("/tasks")
def get_tasks():
    try:
        response = supabase.table("tasks").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")


@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    try:
        response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not response.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    return response.data[0]


@app.post("/tasks")
def create_task(task: TaskCreate):
    try:
        response = supabase.table("tasks").insert(task.model_dump()).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")

    return response.data[0]


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    existing = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    update_data = task.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    try:
        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

    return response.data[0]


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    existing = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Task with id {task_id} not found")

    try:
        supabase.table("tasks").delete().eq("id", task_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")

    return {"message": f"Task {task_id} deleted successfully"}