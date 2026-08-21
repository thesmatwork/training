import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase_client() -> Client:
    """
    Create and return Supabase client.
    """

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "SUPABASE_URL or SUPABASE_KEY is missing in .env file"
        )

    return create_client(SUPABASE_URL, SUPABASE_KEY)


def add_student(student_data):
    """
    Add a new student to Supabase.
    """

    supabase = get_supabase_client()

    response = (
        supabase
        .table("students")
        .insert(student_data)
        .execute()
    )

    return response


def get_all_students():
    """
    Get all students from Supabase.
    """

    supabase = get_supabase_client()

    response = (
        supabase
        .table("students")
        .select("*")
        .order("id")
        .execute()
    )

    return response.data


def get_student_by_id(id):
    """
    Get one student using Student ID.
    """

    supabase = get_supabase_client()

    response = (
        supabase
        .table("students")
        .select("*")
        .eq("id", id)
        .execute()
    )

    return response.data


def search_students(search_text):
    """
    Search students by Student ID, Name or Email.
    """

    supabase = get_supabase_client()

    # Get all students first.
    # Filtering is performed in Python to keep this beginner-friendly.
    response = (
        supabase
        .table("students")
        .select("*")
        .order("id")
        .execute()
    )

    students = response.data

    search_text = search_text.lower().strip()

    results = []

    for student in students:

        id = str(student.get("id", "")).lower()
        name = str(student.get("name", "")).lower()
        email = str(student.get("email", "")).lower()

        if (
            search_text in id
            or search_text in name
            or search_text in email
        ):
            results.append(student)

    return results


def update_student(id, student_data):
    """
    Update an existing student.
    """

    supabase = get_supabase_client()

    response = (
        supabase
        .table("students")
        .update(student_data)
        .eq("id", id)
        .execute()
    )

    return response


def delete_student(id):
    """
    Delete a student.
    """

    supabase = get_supabase_client()

    response = (
        supabase
        .table("students")
        .delete()
        .eq("id", id)
        .execute()
    )

    return response