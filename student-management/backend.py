from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import database


app = FastAPI(
    title="Student Management API",
    description="Backend API for Student Management System",
    version="1.0.0"
)


# -------------------------
# Request Model
# -------------------------

class Student(BaseModel):
    name: str
    email: str
    phone: str
    department: str
    course: str
    year: int
    address: str


# -------------------------
# Home
# -------------------------

@app.get("/")
def home():
    return {
        "message": "Student Management API is running"
    }


# -------------------------
# Health Check
# -------------------------

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Backend is working"
    }


# -------------------------
# Get All Students
# -------------------------

@app.get("/students")
def get_students():

    try:
        students = database.get_all_students()

        return {
            "success": True,
            "count": len(students),
            "students": students
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/students/{student_id}")
def get_student(student_id: int):

    try:
        supabase = database.get_supabase_client()

        response = (
            supabase
            .table("students")
            .select("*")
            .eq("id", student_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return {
            "success": True,
            "student": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.put("/students/{student_id}")
def update_student(student_id: int, student: Student):

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
            .eq("id", student_id)
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


@app.delete("/students/{student_id}")
def delete_student(student_id: int):

    try:
        supabase = database.get_supabase_client()

        response = (
            supabase
            .table("students")
            .delete()
            .eq("id", student_id)
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


# -------------------------
# Add Student
# -------------------------

@app.post("/students")
def add_student(student: Student):

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