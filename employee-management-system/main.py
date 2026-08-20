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
    print("6. View Employee Details")
    print("7. Exit")


def main():
    # Connect to the database and make sure the table exists.
    conn = database.create_connection()
    if conn is None:
        print("Could not connect to the database. Exiting.")
        return

    database.create_table(conn)

    while True:
        display_menu()
        choice = input("Enter your choice: ").strip()

        try:
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
                employee.view_employee_details(conn)
            elif choice == "7":
                print("Thank you for using Employee Management System. Goodbye!")
                break
            else:
                print("Invalid choice. Please enter a number between 1 and 7.")

        except KeyboardInterrupt:
            # Lets the user press Ctrl+C without an ugly traceback.
            print("\nOperation cancelled by user.")
        except Exception as e:
            # Final safety net so an unexpected error never crashes the app.
            print(f"Something went wrong: {e}")

    conn.close()


if __name__ == "__main__":
    main()