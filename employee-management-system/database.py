"""
database.py

Responsible ONLY for one thing: connecting to Supabase.

There is no SQLite here, no CREATE TABLE, and no local .db file.
The 'employees' table already exists in Postgres (see supabase_setup.sql,
which you run once in the Supabase SQL Editor before starting the app).
This file just builds the client that employee.py uses to talk to it.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load SUPABASE_URL and SUPABASE_KEY from a local .env file.
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


def create_connection():
    """
    Creates and returns a Supabase client.
    Returns None if credentials are missing or the client can't be
    created, so main.py can handle it safely instead of crashing.
    """
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("Missing SUPABASE_URL or SUPABASE_KEY.")
            print("Create a .env file with these values (see .env.example).")
            return None

        client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return client

    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        return None