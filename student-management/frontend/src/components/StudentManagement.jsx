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

  // ==========================================
  // Convert API errors into readable messages
  // ==========================================
  const getErrorMessage = (data, defaultMessage) => {
    if (!data) {
      return defaultMessage;
    }

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

  // ==========================================
  // Load Students
  // ==========================================
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

  // ==========================================
  // Handle Input
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // Add / Update
  // ==========================================
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

      console.log("Sending request:", {
        method,
        url,
        payload,
      });

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

      console.log("API response:", data);

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

      if (isEditing) {
        setMessage("Student updated successfully.");
      } else {
        setMessage("Student added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadStudents();
    } catch (err) {
      console.error("Save error:", err);

      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Edit
  // ==========================================
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

  // ==========================================
  // Cancel Edit
  // ==========================================
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  // ==========================================
  // Delete
  // ==========================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete student ${id}?`
    );

    if (!confirmed) {
      return;
    }

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

  // ==========================================
  // Search
  // ==========================================
  const filteredStudents = students.filter((student) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

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
        .includes(value)
    );
  });

  return (
    <div className="student-page">

      {/* ================= HEADER ================= */}

      <header className="top-header">
        <div>
          <h1>Student Management</h1>

          <p>
            Logged in as: <strong>{email}</strong>
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => onLogout()}
        >
          Logout
        </button>
      </header>

      <main className="student-container">

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

        {/* ================= FORM ================= */}

        <section className="student-card">

          <div className="section-header">

            <div>
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

          </div>

          <form
            onSubmit={handleSubmit}
            className="student-form"
          >

            <div className="form-group">
              <label>Student ID</label>

              <input
                type="number"
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Student ID"
                required
                disabled={editingId !== null}
              />
            </div>

            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Student name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>

            <div className="form-group">
              <label>Department</label>

              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
              />
            </div>

            <div className="form-group">
              <label>Course</label>

              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Course"
              />
            </div>

            <div className="form-group">
              <label>Year</label>

              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Year"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
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

        <section className="student-card">

          <div className="students-header">

            <div>
              <h2>Students</h2>

              <p>
                Total students:{" "}
                <strong>{students.length}</strong>
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

          <div className="search-container">

            <input
              type="text"
              placeholder="Search by ID, name, email, department or course..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          {/* TABLE */}

          {loading ? (

            <div className="loading">
              Loading students...
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="no-students">
              No students found.
            </div>

          ) : (

            <div className="table-container">

              <table className="students-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredStudents.map((student) => (

                    <tr key={student.id}>

                      <td>{student.id}</td>

                      <td className="student-name">
                        {student.name}
                      </td>

                      <td>{student.email}</td>

                      <td>{student.phone}</td>

                      <td>
                        <span className="badge">
                          {student.department}
                        </span>
                      </td>

                      <td>{student.course}</td>

                      <td>{student.year}</td>

                      <td>{student.address}</td>

                      <td>

                        <div className="action-buttons">

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

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}