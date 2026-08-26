import React, { useEffect, useState } from "react";
import "./StudentManagement.css";

const API_URL = "http://127.0.0.1:8000";

const emptyForm = {
  id: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  course: "",
  year: "",
  address: "",
};

export default function StudentManagement({ token, email, onLogout }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getErrorMessage = (data, defaultMessage) => {
    if (!data) return defaultMessage;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(", ");
    }

    if (typeof data.detail === "object") {
      return (
        data.detail.message ||
        data.detail.msg ||
        JSON.stringify(data.detail)
      );
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return defaultMessage;
  };

  // ==============================
  // LOAD STUDENTS
  // ==============================
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/students`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to load students")
        );
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ==============================
  // INPUT CHANGE
  // ==============================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // ADD / UPDATE
  // ==============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/students/${editingId}`
        : `${API_URL}/students`;

      const method = isEditing ? "PUT" : "POST";

      const payload = {
        id: Number(form.id),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        year: Number(form.year),
        address: form.address.trim(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            isEditing
              ? "Failed to update student"
              : "Failed to add student"
          )
        );
      }

      setMessage(
        isEditing
          ? "Student updated successfully."
          : "Student added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadStudents();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // EDIT
  // ==============================
  const handleEdit = (student) => {
    setEditingId(student.id);

    setForm({
      id: student.id ?? "",
      name: student.name ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      department: student.department ?? "",
      course: student.course ?? "",
      year: student.year ?? "",
      address: student.address ?? "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // CANCEL EDIT
  // ==============================
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete student ${id}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to delete student")
        );
      }

      setMessage("Student deleted successfully.");

      await loadStudents();
    } catch (err) {
      setError(err.message || "Failed to delete student");
    }
  };

  // ==============================
  // SEARCH
  // ==============================
  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase().trim();

    if (!value) return true;

    return (
      String(student.id ?? "")
        .toLowerCase()
        .includes(value) ||
      String(student.name ?? "")
        .toLowerCase()
        .includes(value) ||
      String(student.email ?? "")
        .toLowerCase()
        .includes(value) ||
      String(student.department ?? "")
        .toLowerCase()
        .includes(value) ||
      String(student.course ?? "")
        .toLowerCase()
        .includes(value) ||
      String(student.phone ?? "")
        .toLowerCase()
        .includes(value)
    );
  });

  return (
    <div className="student-management">

      {/* ================= HEADER ================= */}

      <header className="student-header">
        <h1>Student Management</h1>

        <p>
          Manage your students easily
        </p>
      </header>

      {/* ================= USER AREA ================= */}

      <div className="user-section">
        <span className="welcome-text">
          Welcome, {email}
        </span>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* ================= MESSAGES ================= */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ================= ADD STUDENT ================= */}

      <section className="student-form-card">

        <div className="form-title">
          <h2>
            {editingId !== null
              ? "Edit Student"
              : "Add Student"}
          </h2>

          <p>
            {editingId !== null
              ? `Updating student ID ${editingId}`
              : "Enter student details below"}
          </p>
        </div>

        <form
          className="student-form"
          onSubmit={handleSubmit}
        >

          {/* 
            IMPORTANT:
            CSS file is not changed.
            This inline grid changes only the form
            from 2 columns to 4 columns.
          */}

          <div
            className="student-form-grid"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >

            {/* ROW 1 */}

            <div>
              <label>Student ID</label>

              <input
                className="student-input"
                type="number"
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Student ID"
                required
                disabled={editingId !== null}
              />
            </div>

            <div>
              <label>Name</label>

              <input
                className="student-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Student name"
                required
              />
            </div>

            <div>
              <label>Email</label>

              <input
                className="student-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            <div>
              <label>Phone</label>

              <input
                className="student-input"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>

            {/* ROW 2 */}

            <div>
              <label>Department</label>

              <input
                className="student-input"
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
              />
            </div>

            <div>
              <label>Course</label>

              <input
                className="student-input"
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Course"
              />
            </div>

            <div>
              <label>Year</label>

              <input
                className="student-input"
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Year"
                min="1"
              />
            </div>

            <div>
              <label>Address</label>

              <input
                className="student-input"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="add-student-btn"
              disabled={saving}
            >
              {saving
                ? editingId !== null
                  ? "Updating..."
                  : "Adding..."
                : editingId !== null
                ? "Update Student"
                : "Add Student"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* ================= STUDENTS ================= */}

      <section className="students-container">

        <div className="students-heading">

          <div>
            <h2>Students</h2>

            <p>
              {students.length}{" "}
              {students.length === 1
                ? "student"
                : "students"}
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={loadStudents}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* SEARCH */}

        <div className="search-section">

          <input
            className="search-input"
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* STUDENT LIST */}

        {loading ? (
          <div className="no-students">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="no-students">
            No students found.
          </div>
        ) : (
          <div className="student-list">

            {filteredStudents.map((student) => (

              <article
                className="student-card"
                key={student.id}
              >

                <div className="student-card-left">

                  <div className="student-card-title">

                    <div>
                      <h3 className="student-name">
                        {student.name}
                      </h3>

                      <span className="student-id">
                        Student ID: {student.id}
                      </span>
                    </div>

                    {student.department && (
                      <span className="department-badge">
                        {student.department}
                      </span>
                    )}

                  </div>

                  <div className="student-details">

                    <div className="student-detail">
                      <span>Email</span>
                      <strong>
                        {student.email || "—"}
                      </strong>
                    </div>

                    <div className="student-detail">
                      <span>Phone</span>
                      <strong>
                        {student.phone || "—"}
                      </strong>
                    </div>

                    <div className="student-detail">
                      <span>Course</span>
                      <strong>
                        {student.course || "—"}
                      </strong>
                    </div>

                    <div className="student-detail">
                      <span>Year</span>
                      <strong>
                        {student.year || "—"}
                      </strong>
                    </div>

                    <div className="student-detail full-width">
                      <span>Address</span>
                      <strong>
                        {student.address || "—"}
                      </strong>
                    </div>

                  </div>

                </div>

                <div className="student-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(student)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(student.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

    </div>
  );
}