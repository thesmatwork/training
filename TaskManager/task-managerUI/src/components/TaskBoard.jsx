import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "http://192.168.1.13:8000";

// Your FastAPI backend is being used directly.
const MOCK_MODE = false;

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  department: "",
  course: "",
  year: "",
  address: "",
};

async function mockApiRequest(path, options = {}) {
  throw new Error("Mock mode is disabled.");
}

async function apiRequest(path, options = {}) {
  if (MOCK_MODE) {
    return mockApiRequest(path, options);
  }

  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    throw new Error(
      `Can't reach the backend. Make sure FastAPI is running at ${API_BASE}. Also check CORS settings.`
    );
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;

    try {
      const body = await res.json();

      if (Array.isArray(body.detail)) {
        detail = body.detail.map((item) => item.msg).join(", ");
      } else if (body.detail) {
        detail = body.detail;
      }
    } catch (_) {
      // No JSON response
    }

    throw new Error(detail);
  }

  return res.json();
}

function Toast({ message, kind, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: kind === "error" ? "#3F1D1D" : "#1C2A22",
        color: "#F5F1E8",
        padding: "11px 18px",
        borderRadius: 10,
        fontSize: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 1000,
        maxWidth: 450,
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

function StudentCard({
  student,
  onEdit,
  onDelete,
  busy,
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E0D4",
        borderRadius: 14,
        padding: 18,
        opacity: busy ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {student.name}
            </span>

            <span
              style={{
                background: "#FEF3E2",
                color: "#92400E",
                borderRadius: 999,
                padding: "3px 9px",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              ID: {student.id}
            </span>
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 13.5,
              color: "#5C5749",
              lineHeight: 1.6,
            }}
          >
            <div>
              <strong>Email:</strong> {student.email}
            </div>

            <div>
              <strong>Phone:</strong> {student.phone}
            </div>

            <div>
              <strong>Department:</strong> {student.department}
            </div>

            <div>
              <strong>Course:</strong> {student.course}
            </div>

            <div>
              <strong>Year:</strong> {student.year}
            </div>

            <div>
              <strong>Address:</strong> {student.address}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onEdit(student)}
            disabled={busy}
            style={{
              fontFamily: "inherit",
              fontSize: 12.5,
              padding: "6px 12px",
              borderRadius: 7,
              border: "1px solid #DAD5C7",
              background: "transparent",
              color: "#5C5749",
              cursor: busy ? "default" : "pointer",
            }}
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(student)}
            disabled={busy}
            style={{
              fontFamily: "inherit",
              fontSize: 12.5,
              padding: "6px 12px",
              borderRadius: 7,
              border: "1px solid #E6C7C4",
              background: "transparent",
              color: "#B4332F",
              cursor: busy ? "default" : "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentManagement() {
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingStudent, setEditingStudent] = useState(null);

  const [busyIds, setBusyIds] = useState(() => new Set());

  const [search, setSearch] = useState("");

  const showToast = (message, kind = "info") => {
    setToast({ message, kind });
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const markBusy = (id, value) => {
    setBusyIds((prev) => {
      const next = new Set(prev);

      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await apiRequest("/students");

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async (e) => {
    e.preventDefault();

    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Student name is required.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    if (!form.department.trim()) {
      setFormError("Department is required.");
      return;
    }

    if (!form.course.trim()) {
      setFormError("Course is required.");
      return;
    }

    if (!form.year) {
      setFormError("Year is required.");
      return;
    }

    if (!form.address.trim()) {
      setFormError("Address is required.");
      return;
    }

    const yearNumber = Number(form.year);

    if (Number.isNaN(yearNumber)) {
      setFormError("Year must be a valid number.");
      return;
    }

    setSubmitting(true);

    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        year: yearNumber,
        address: form.address.trim(),
      };

      const data = await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const createdStudent = Array.isArray(data.student)
        ? data.student[0]
        : data.student;

      if (createdStudent) {
        setStudents((prev) => [...prev, createdStudent]);
      }

      setForm(EMPTY_FORM);

      showToast("Student added successfully.");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
      return;
    }

    markBusy(student.id, true);

    const previousStudents = students;

    setStudents((prev) =>
      prev.filter((item) => item.id !== student.id)
    );

    try {
      await apiRequest(`/students/${student.id}`, {
        method: "DELETE",
      });

      showToast(`${student.name} deleted successfully.`);
    } catch (err) {
      setStudents(previousStudents);
      showToast(err.message, "error");
    } finally {
      markBusy(student.id, false);
    }
  };

  const startEdit = (student) => {
    setEditingStudent(student);
  };

  const cancelEdit = () => {
    setEditingStudent(null);
  };

  const saveEdit = async () => {
    if (!editingStudent.name.trim()) {
      showToast("Student name cannot be empty.", "error");
      return;
    }

    if (!editingStudent.email.trim()) {
      showToast("Email cannot be empty.", "error");
      return;
    }

    if (!editingStudent.phone.trim()) {
      showToast("Phone cannot be empty.", "error");
      return;
    }

    markBusy(editingStudent.id, true);

    try {
      const body = {
        name: editingStudent.name.trim(),
        email: editingStudent.email.trim(),
        phone: editingStudent.phone.trim(),
        department: editingStudent.department.trim(),
        course: editingStudent.course.trim(),
        year: Number(editingStudent.year),
        address: editingStudent.address.trim(),
      };

      const data = await apiRequest(
        `/students/${editingStudent.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );

      const updatedStudent = Array.isArray(data.student)
        ? data.student[0]
        : data.student;

      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? updatedStudent
            : student
        )
      );

      setEditingStudent(null);

      showToast("Student updated successfully.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      markBusy(editingStudent.id, false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      String(student.id).includes(query) ||
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.department?.toLowerCase().includes(query) ||
      student.course?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F5EF",
        fontFamily:
          "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
        color: "#1C1B18",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              fontSize: 34,
              margin: 0,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            Student Management
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: 14,
              color: "#6B6558",
            }}
          >
            {loading
              ? "Loading students..."
              : `${students.length} student${
                  students.length === 1 ? "" : "s"
                } registered`}
          </p>
        </header>

        {/* Add Student Form */}
        <form
          onSubmit={handleAddStudent}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E0D4",
            borderRadius: 14,
            padding: 20,
            marginBottom: 25,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 21,
            }}
          >
            Add Student
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <input
              value={form.name}
              onChange={(e) =>
                updateForm("name", e.target.value)
              }
              placeholder="Student Name"
              style={inputStyle}
            />

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                updateForm("email", e.target.value)
              }
              placeholder="Email"
              style={inputStyle}
            />

            <input
              value={form.phone}
              onChange={(e) =>
                updateForm("phone", e.target.value)
              }
              placeholder="Phone Number"
              style={inputStyle}
            />

            <input
              value={form.department}
              onChange={(e) =>
                updateForm("department", e.target.value)
              }
              placeholder="Department"
              style={inputStyle}
            />

            <input
              value={form.course}
              onChange={(e) =>
                updateForm("course", e.target.value)
              }
              placeholder="Course"
              style={inputStyle}
            />

            <input
              type="number"
              value={form.year}
              onChange={(e) =>
                updateForm("year", e.target.value)
              }
              placeholder="Year"
              min="1"
              style={inputStyle}
            />
          </div>

          <textarea
            value={form.address}
            onChange={(e) =>
              updateForm("address", e.target.value)
            }
            placeholder="Address"
            rows={3}
            style={{
              ...inputStyle,
              marginTop: 12,
              resize: "vertical",
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#B4332F",
              }}
            >
              {formError}
            </span>

            <button
              type="submit"
              disabled={submitting}
              style={{
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: submitting
                  ? "#C99A6B"
                  : "#B45309",
                color: "#FFF8EF",
                cursor: submitting
                  ? "default"
                  : "pointer",
              }}
            >
              {submitting
                ? "Adding..."
                : "Add Student"}
            </button>
          </div>
        </form>

        {/* Search */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E0D4",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email, department or course..."
            style={inputStyle}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#8A8371",
            }}
          >
            Loading students...
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div
            style={{
              border: "1px solid #E6C7C4",
              background: "#FBF1F0",
              color: "#7A2E29",
              borderRadius: 12,
              padding: "16px 18px",
              fontSize: 14,
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 5,
              }}
            >
              Couldn't load students
            </strong>

            {loadError}

            <div style={{ marginTop: 10 }}>
              <button
                onClick={loadStudents}
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: "1px solid #C97A74",
                  background: "transparent",
                  color: "#7A2E29",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !loadError &&
          filteredStudents.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                color: "#8A8371",
                border: "1px dashed #D8D2C2",
                borderRadius: 12,
              }}
            >
              {students.length === 0
                ? "No students registered yet. Add your first student above."
                : "No students match your search."}
            </div>
          )}

        {/* Students */}
        {!loading &&
          !loadError &&
          filteredStudents.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  busy={busyIds.has(student.id)}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 500,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                margin: "0 0 18px",
              }}
            >
              Update Student
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <input
                value={editingStudent.name}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    name: e.target.value,
                  })
                }
                placeholder="Student Name"
                style={inputStyle}
              />

              <input
                type="email"
                value={editingStudent.email}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
                style={inputStyle}
              />

              <input
                value={editingStudent.phone}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone"
                style={inputStyle}
              />

              <input
                value={editingStudent.department}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    department: e.target.value,
                  })
                }
                placeholder="Department"
                style={inputStyle}
              />

              <input
                value={editingStudent.course}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    course: e.target.value,
                  })
                }
                placeholder="Course"
                style={inputStyle}
              />

              <input
                type="number"
                value={editingStudent.year}
                onChange={(e) =>
                  setEditingStudent({
                    ...editingStudent,
                    year: e.target.value,
                  })
                }
                placeholder="Year"
                style={inputStyle}
              />
            </div>

            <textarea
              value={editingStudent.address}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  address: e.target.value,
                })
              }
              placeholder="Address"
              rows={3}
              style={{
                ...inputStyle,
                marginTop: 12,
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                onClick={cancelEdit}
                style={secondaryButton}
              >
                Cancel
              </button>

              <button
                onClick={saveEdit}
                style={primaryButton}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

const inputStyle = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #DAD5C7",
  outline: "none",
  background: "#FBFAF6",
  width: "100%",
  boxSizing: "border-box",
};

const primaryButton = {
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  padding: "9px 18px",
  borderRadius: 8,
  border: "none",
  background: "#B45309",
  color: "#FFF8EF",
  cursor: "pointer",
};

const secondaryButton = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: "9px 18px",
  borderRadius: 8,
  border: "1px solid #DAD5C7",
  background: "transparent",
  color: "#5C5749",
  cursor: "pointer",
};