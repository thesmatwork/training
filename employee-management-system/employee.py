"""
employee.py

Responsible for all employee-related operations:
- Adding, viewing, searching, updating, and deleting employees.
- Validating user input (required fields, email format, salary as a number).

Every function here receives an already-open database connection (conn)
from main.py, so this file never has to worry about connecting itself.
"""

import re
import sqlite3

# Simple pattern to check for a valid-looking email, e.g. name@example.com
EMAIL_PATTERN = r'^[\w\.-]+@[\w\.-]+\.\w+$'


# ---------------------------------------------------------------------
# Input validation helpers
# ---------------------------------------------------------------------

def get_non_empty_input(prompt):
    """Keeps asking until the user types something that isn't blank."""
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("This field cannot be empty. Please try again.")


def validate_email(email):
    """Returns True if the email matches a basic valid email pattern."""
    return re.match(EMAIL_PATTERN, email) is not None


def get_valid_email(current_email=None):
    """
    Keeps asking until a valid email is entered.
    If current_email is given, pressing Enter keeps that value (used for updates).
    """
    while True:
        if current_email:
            email = input(f"Enter new Email [{current_email}]: ").strip() or current_email
        else:
            email = input("Enter Email: ").strip()

        if validate_email(email):
            return email
        print("Invalid email format. Example: name@example.com")


def get_valid_salary(current_salary=None):
    """
    Keeps asking until a valid, non-negative number is entered.
    If current_salary is given, pressing Enter keeps that value (used for updates).
    """
    while True:
        if current_salary is not None:
            salary_str = input(f"Enter new Salary [{current_salary}]: ").strip()
            if salary_str == "":
                return current_salary
        else:
            salary_str = input("Enter Salary: ").strip()

        try:
            salary = float(salary_str)
            if salary < 0:
                print("Salary cannot be negative. Please try again.")
                continue
            return salary
        except ValueError:
            print("Invalid salary. Please enter a numeric value (e.g. 25000 or 25000.50).")


def print_employee_details(row):
    """Prints a single employee's full details in a readable block format."""
    emp_id, name, email, phone, department, designation, salary = row
    print("-" * 40)
    print(f"Employee ID   : {emp_id}")
    print(f"Name          : {name}")
    print(f"Email         : {email}")
    print(f"Phone         : {phone}")
    print(f"Department    : {department}")
    print(f"Designation   : {designation}")
    print(f"Salary        : {salary:.2f}")
    print("-" * 40)


# ---------------------------------------------------------------------
# Core features
# ---------------------------------------------------------------------

def add_employee(conn):
    """Prompts for employee details and inserts a new record."""
    print("\n--- Add New Employee ---")
    try:
        cursor = conn.cursor()

        emp_id = get_non_empty_input("Enter Employee ID: ")

        # Check the ID isn't already used, since emp_id must be unique.
        cursor.execute("SELECT emp_id FROM employees WHERE emp_id = ?", (emp_id,))
        if cursor.fetchone():
            print(f"Employee ID '{emp_id}' already exists. Please use a different ID.")
            return

        name = get_non_empty_input("Enter Employee Name: ")
        email = get_valid_email()
        phone = get_non_empty_input("Enter Phone Number: ")
        department = get_non_empty_input("Enter Department: ")
        designation = get_non_empty_input("Enter Designation: ")
        salary = get_valid_salary()

        # Parameterized query (the ? placeholders) protects against SQL injection.
        cursor.execute("""
            INSERT INTO employees (emp_id, name, email, phone, department, designation, salary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (emp_id, name, email, phone, department, designation, salary))
        conn.commit()

        print(f"Employee '{name}' added successfully.")

    except sqlite3.Error as e:
        print(f"Database error while adding employee: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


def view_all_employees(conn):
    """Displays every employee record in a readable table."""
    print("\n--- All Employees ---")
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM employees")
        rows = cursor.fetchall()

        if not rows:
            print("No employee records found.")
            return

        header = f"{'ID':<10}{'Name':<18}{'Email':<25}{'Phone':<15}{'Department':<15}{'Designation':<15}{'Salary':<10}"
        print(header)
        print("-" * len(header))

        for row in rows:
            emp_id, name, email, phone, department, designation, salary = row
            print(f"{emp_id:<10}{name:<18}{email:<25}{phone:<15}{department:<15}{designation:<15}{salary:<10.2f}")

    except sqlite3.Error as e:
        print(f"Database error while fetching employees: {e}")


def search_employee(conn):
    """Searches for employees by ID or by (partial) name match."""
    print("\n--- Search Employee ---")
    print("1. Search by Employee ID")
    print("2. Search by Name")
    choice = input("Enter your choice: ").strip()

    try:
        cursor = conn.cursor()

        if choice == "1":
            emp_id = get_non_empty_input("Enter Employee ID: ")
            cursor.execute("SELECT * FROM employees WHERE emp_id = ?", (emp_id,))
        elif choice == "2":
            name = get_non_empty_input("Enter Employee Name: ")
            cursor.execute("SELECT * FROM employees WHERE name LIKE ?", (f"%{name}%",))
        else:
            print("Invalid choice. Please enter 1 or 2.")
            return

        rows = cursor.fetchall()
        if not rows:
            print("No matching employee found.")
            return

        for row in rows:
            print_employee_details(row)

    except sqlite3.Error as e:
        print(f"Database error while searching: {e}")


def view_employee_details(conn):
    """Displays the full details of one employee, looked up by ID."""
    print("\n--- View Employee Details ---")
    try:
        emp_id = get_non_empty_input("Enter Employee ID: ")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM employees WHERE emp_id = ?", (emp_id,))
        row = cursor.fetchone()

        if row:
            print_employee_details(row)
        else:
            print(f"No employee found with ID '{emp_id}'.")

    except sqlite3.Error as e:
        print(f"Database error while fetching employee details: {e}")


def update_employee(conn):
    """
    Updates an existing employee's details.
    Pressing Enter on any field keeps its current value.
    """
    print("\n--- Update Employee ---")
    try:
        emp_id = get_non_empty_input("Enter Employee ID to update: ")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM employees WHERE emp_id = ?", (emp_id,))
        row = cursor.fetchone()

        if not row:
            print(f"No employee found with ID '{emp_id}'.")
            return

        print("Current details:")
        print_employee_details(row)
        print("Press Enter on any field to keep its current value.\n")

        _, current_name, current_email, current_phone, current_dept, current_desig, current_salary = row

        name = input(f"Enter new Name [{current_name}]: ").strip() or current_name
        email = get_valid_email(current_email)
        phone = input(f"Enter new Phone [{current_phone}]: ").strip() or current_phone
        department = input(f"Enter new Department [{current_dept}]: ").strip() or current_dept
        designation = input(f"Enter new Designation [{current_desig}]: ").strip() or current_desig
        salary = get_valid_salary(current_salary)

        cursor.execute("""
            UPDATE employees
            SET name = ?, email = ?, phone = ?, department = ?, designation = ?, salary = ?
            WHERE emp_id = ?
        """, (name, email, phone, department, designation, salary, emp_id))
        conn.commit()

        print("Employee updated successfully.")

    except sqlite3.Error as e:
        print(f"Database error while updating employee: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


def delete_employee(conn):
    """Deletes an employee by ID, after asking for confirmation."""
    print("\n--- Delete Employee ---")
    try:
        emp_id = get_non_empty_input("Enter Employee ID to delete: ")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM employees WHERE emp_id = ?", (emp_id,))
        row = cursor.fetchone()

        if not row:
            print(f"No employee found with ID '{emp_id}'.")
            return

        print_employee_details(row)
        confirm = input("Are you sure you want to delete this employee? (yes/no): ").strip().lower()

        if confirm == "yes":
            cursor.execute("DELETE FROM employees WHERE emp_id = ?", (emp_id,))
            conn.commit()
            print("Employee deleted successfully.")
        else:
            print("Delete cancelled.")

    except sqlite3.Error as e:
        print(f"Database error while deleting employee: {e}")