from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database


app = FastAPI(
    title="Student Management API",
    description="Backend API for Student Management System",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# LOGIN MODEL
# ==================================================

class LoginRequest(BaseModel):
    email: str
    password: str


# ==================================================
# STUDENT BASE MODEL
# ==================================================

class StudentBase(BaseModel):
    name: str
    email: str
    phone: str
    department: str
    course: str
    year: int
    address: str


# ==================================================
# STUDENT CREATE MODEL
# ==================================================

class StudentCreate(StudentBase):
    pass


# ==================================================
# STUDENT UPDATE MODEL
# ==================================================

class StudentUpdate(StudentBase):
    pass


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Student Management API is running"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Backend is working"
    }


# ==================================================
# LOGIN
# ==================================================

@app.post("/login")
def login(request: LoginRequest):

    if (
        request.email == "admin@gmail.com"
        and request.password == "admin123"
    ):
        return {
            "success": True,
            "token": "student-management-token",
            "email": request.email
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


# ==================================================
# GET ALL STUDENTS
# ==================================================

@app.get("/students")
def get_students():

    try:
        students = database.get_all_students()

        return students

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# GET SINGLE STUDENT
# ==================================================

@app.get("/students/{id}")
def get_student(id: int):

    try:

        supabase = database.get_supabase_client()

        response = (
            supabase
            .table("students")
            .select("*")
            .eq("id", id)
            .execute()
        )

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# ADD STUDENT
# ==================================================

@app.post("/students")
def add_student(student: StudentCreate):

    try:

        student_data = {
            "name": student.name,
            "email": student.email,
            "phone": student.phone,
            "department": student.department,
            "course": student.course,
            "year": student.year,
            "address": student.address
        }

        response = database.add_student(student_data)

        return {
            "success": True,
            "message": "Student added successfully",
            "student": response.data
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# UPDATE STUDENT
# ==================================================

@app.put("/students/{id}")
def update_student(
    id: int,
    student: StudentUpdate
):

    try:

        supabase = database.get_supabase_client()

        student_data = {
            "name": student.name,
            "email": student.email,
            "phone": student.phone,
            "department": student.department,
            "course": student.course,
            "year": student.year,
            "address": student.address
        }

        response = (
            supabase
            .table("students")
            .update(student_data)
            .eq("id", id)
            .execute()
        )

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return {
            "success": True,
            "message": "Student updated successfully",
            "student": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==================================================
# DELETE STUDENT
# ==================================================

@app.delete("/students/{id}")
def delete_student(id: int):

    try:

        supabase = database.get_supabase_client()

        response = (
            supabase
            .table("students")
            .delete()
            .eq("id", id)
            .execute()
        )

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return {
            "success": True,
            "message": "Student deleted successfully",
            "student": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )