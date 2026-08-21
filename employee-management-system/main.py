"""
main.py

Entry point of the Employee Management System.
Displays the menu, reads the user's choice, and delegates the actual
work to the functions in employee.py and database.py.
"""

import database
import employee


def display_menu():
    print("\n===== Employee Management System =====")
    print("1. Add Employee")
    print("2. View All Employees")
    print("3. Search Employee")
    print("4. Update Employee")
    print("5. Delete Employee")
    print("6. Exit")


def main():
    # Connect to Supabase. Make sure you've already run supabase_setup.sql
    # once in your Supabase project's SQL Editor to create the table.
    conn = database.create_connection()
    if conn is None:
        print("Could not connect to Supabase. Exiting.")
        return

    while True:
        display_menu()

        try:
            choice = input("Enter your choice: ").strip()

            if choice == "1":
                employee.add_employee(conn)
            elif choice == "2":
                employee.view_all_employees(conn)
            elif choice == "3":
                employee.search_employee(conn)
            elif choice == "4":
                employee.update_employee(conn)
            elif choice == "5":
                employee.delete_employee(conn)
            elif choice == "6":
                print("Thank you for using Employee Management System. Goodbye!")
                break
            else:
                print("Invalid choice. Please enter a number between 1 and 6.")

        except KeyboardInterrupt:
            print("\nOperation cancelled by user.")
        except Exception as e:
            print(f"Something went wrong: {e}")


if __name__ == "__main__":
    main()