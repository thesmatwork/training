import streamlit as st
import pandas as pd

import database


# ---------------------------------------------------------
# PAGE CONFIGURATION
# ---------------------------------------------------------

st.set_page_config(
    page_title="Student Management System",
    page_icon="🎓",
    layout="wide"
)


# ---------------------------------------------------------
# CUSTOM CSS
# ---------------------------------------------------------

st.markdown(
    """
    <style>
        .main-title {
            font-size: 35px;
            font-weight: bold;
        }

        .subtitle {
            font-size: 18px;
            color: gray;
        }
    </style>
    """,
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# SIDEBAR
# ---------------------------------------------------------

st.sidebar.title("🎓 Student Management")

st.sidebar.write("Navigation")

menu = st.sidebar.radio(
    "Select Option",
    [
        "Dashboard",
        "Add Student",
        "View Students",
        "Search Student",
        "Update Student",
        "Delete Student"
    ]
)


# ---------------------------------------------------------
# HELPER FUNCTION
# ---------------------------------------------------------

def load_students():
    """
    Load students from Supabase.
    """

    try:
        return database.get_all_students()

    except Exception as e:
        st.error(f"Error loading students: {e}")
        return []


# ---------------------------------------------------------
# DASHBOARD
# ---------------------------------------------------------

if menu == "Dashboard":

    st.markdown(
        '<div class="main-title">🎓 Student Management Dashboard</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="subtitle">Manage student information using Streamlit and Supabase.</div>',
        unsafe_allow_html=True
    )

    st.divider()

    students = load_students()

    total_students = len(students)

    departments = set()

    for student in students:
        department = student.get("department")

        if department:
            departments.add(department)

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Total Students",
            total_students
        )

    with col2:
        st.metric(
            "Departments",
            len(departments)
        )

    with col3:
        st.metric(
            "Database",
            "Supabase"
        )

    st.divider()

    st.subheader("Welcome 👋")

    st.write(
        """
        Use the sidebar to manage student information.

        **Available operations:**

        - Add new students
        - View all students
        - Search students
        - Update student information
        - Delete students
        """
    )


# ---------------------------------------------------------
# ADD STUDENT
# ---------------------------------------------------------

elif menu == "Add Student":

    st.title("➕ Add Student")

    st.write("Enter the student's information below.")

    with st.form("add_student_form"):

        name = st.text_input(
            "Student Name *"
        )

        email = st.text_input(
            "Email *"
        )

        phone = st.text_input(
            "Phone Number"
        )

        department = st.text_input(
            "Department"
        )

        course = st.text_input(
            "Course"
        )

        year = st.number_input(
            "Year",
            min_value=1,
            max_value=10,
            value=1,
            step=1
        )

        address = st.text_area(
            "Address"
        )

        submit = st.form_submit_button(
            "Add Student"
        )

        if submit:

            # Validation
            if not name.strip():
                st.error("Student Name is required.")

            elif not email.strip():
                st.error("Email is required.")

            else:

                student_data = {
                    "name": name.strip(),
                    "email": email.strip(),
                    "phone": phone.strip(),
                    "department": department.strip(),
                    "course": course.strip(),
                    "year": year,
                    "address": address.strip()
                }

                try:

                    database.add_student(
                        student_data
                    )

                    st.success(
                        "Student added successfully! ✅"
                    )

                except Exception as e:

                    st.error(
                        f"Error adding student: {e}"
                    )


# ---------------------------------------------------------
# VIEW STUDENTS
# ---------------------------------------------------------

elif menu == "View Students":

    st.title("👨‍🎓 All Students")

    students = load_students()

    if students:

        display_data = []

        for student in students:

            display_data.append(
                {
                    "Student ID": student.get("id"),
                    "Name": student.get("name"),
                    "Email": student.get("email"),
                    "Phone": student.get("phone"),
                    "Department": student.get("department"),
                    "Course": student.get("course"),
                    "Year": student.get("year")
                }
            )

        df = pd.DataFrame(display_data)

        st.dataframe(
            df,
            use_container_width=True,
            hide_index=True
        )

        st.info(
            f"Total students: {len(students)}"
        )

    else:

        st.info(
            "No students found in the database."
        )


# ---------------------------------------------------------
# SEARCH STUDENT
# ---------------------------------------------------------

elif menu == "Search Student":

    st.title("🔍 Search Student")

    search_text = st.text_input(
        "Search by Student ID, Name or Email"
    )

    if search_text.strip():

        try:

            results = database.search_students(
                search_text
            )

            if results:

                for student in results:

                    with st.container(border=True):

                        col1, col2 = st.columns(2)

                        with col1:

                            st.write(
                                f"**Student ID:** {student.get('id')}"
                            )

                            st.write(
                                f"**Name:** {student.get('name')}"
                            )

                            st.write(
                                f"**Email:** {student.get('email')}"
                            )

                            st.write(
                                f"**Phone:** {student.get('phone')}"
                            )

                        with col2:

                            st.write(
                                f"**Department:** {student.get('department')}"
                            )

                            st.write(
                                f"**Course:** {student.get('course')}"
                            )

                            st.write(
                                f"**Year:** {student.get('year')}"
                            )

                            st.write(
                                f"**Address:** {student.get('address')}"
                            )

            else:

                st.warning(
                    "No matching student found."
                )

        except Exception as e:

            st.error(
                f"Search error: {e}"
            )


# ---------------------------------------------------------
# UPDATE STUDENT
# ---------------------------------------------------------

elif menu == "Update Student":

    st.title("✏️ Update Student")

    students = load_students()

    if not students:

        st.info(
            "No students available to update."
        )

    else:

        student_options = {}

        for student in students:

            label = (
                f"{student.get('id')} - "
                f"{student.get('name')}"
            )

            student_options[label] = student

        selected_label = st.selectbox(
            "Select Student",
            list(student_options.keys())
        )

        selected_student = student_options[
            selected_label
        ]

        st.divider()

        with st.form("update_student_form"):

            name = st.text_input(
                "Student Name",
                value=selected_student.get(
                    "name", ""
                )
            )

            email = st.text_input(
                "Email",
                value=selected_student.get(
                    "email", ""
                )
            )

            phone = st.text_input(
                "Phone Number",
                value=selected_student.get(
                    "phone", ""
                )
            )

            department = st.text_input(
                "Department",
                value=selected_student.get(
                    "department", ""
                )
            )

            course = st.text_input(
                "Course",
                value=selected_student.get(
                    "course", ""
                )
            )

            current_year = selected_student.get(
                "year"
            )

            if current_year is None:
                current_year = 1

            year = st.number_input(
                "Year",
                min_value=1,
                max_value=10,
                value=int(current_year),
                step=1
            )

            address = st.text_area(
                "Address",
                value=selected_student.get(
                    "address", ""
                )
            )

            update_button = st.form_submit_button(
                "Update Student"
            )

            if update_button:

                if not name.strip():

                    st.error(
                        "Student Name is required."
                    )

                elif not email.strip():

                    st.error(
                        "Email is required."
                    )

                else:

                    updated_data = {
                        "name": name.strip(),
                        "email": email.strip(),
                        "phone": phone.strip(),
                        "department": department.strip(),
                        "course": course.strip(),
                        "year": year,
                        "address": address.strip()
                    }

                    try:

                        database.update_student(
                            selected_student[
                                "id"
                            ],
                            updated_data
                        )

                        st.success(
                            "Student updated successfully! ✅"
                        )

                    except Exception as e:

                        st.error(
                            f"Error updating student: {e}"
                        )


# ---------------------------------------------------------
# DELETE STUDENT
# ---------------------------------------------------------

elif menu == "Delete Student":

    st.title("🗑️ Delete Student")

    students = load_students()

    if not students:

        st.info(
            "No students available to delete."
        )

    else:

        student_options = {}

        for student in students:

            label = (
                f"{student.get('id')} - "
                f"{student.get('name')}"
            )

            student_options[label] = student

        selected_label = st.selectbox(
            "Select Student",
            list(student_options.keys())
        )

        selected_student = student_options[
            selected_label
        ]

        st.warning(
            f"""
            You are about to delete:

            **Student ID:** {selected_student.get('id')}

            **Name:** {selected_student.get('name')}

            **Email:** {selected_student.get('email')}

            This action cannot be undone.
            """
        )

        confirm = st.checkbox(
            "I confirm that I want to delete this student."
        )

        if st.button(
            "Delete Student",
            type="primary"
        ):

            if not confirm:

                st.error(
                    "Please confirm the deletion first."
                )

            else:

                try:

                    database.delete_student(
                        selected_student[
                            "id"
                        ]
                    )

                    st.success(
                        "Student deleted successfully! ✅"
                    )

                    st.rerun()

                except Exception as e:

                    st.error(
                        f"Error deleting student: {e}"
                    )