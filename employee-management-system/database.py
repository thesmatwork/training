"""
database.py

Responsible ONLY for database-level tasks:
- Connecting to the SQLite database file.
- Creating the 'employees' table if it does not already exist.

Keeping this separate from employee.py means our database setup logic
is in one predictable place.
"""

import sqlite3

# Name of the SQLite database file. It will be created automatically
# in the same folder as this script the first time the program runs.
DB_NAME = "employee_management.db"


def create_connection():
    """
    Creates and returns a connection to the SQLite database.
    Returns None if the connection fails, so the caller can handle it safely.
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None


def create_table(conn):
    """
    Creates the 'employees' table if it doesn't already exist.
    emp_id is the PRIMARY KEY, so it must be unique for every employee.
    """
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                emp_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                department TEXT NOT NULL,
                designation TEXT NOT NULL,
                salary REAL NOT NULL
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")