import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  department: "",
  course: "",
  year: "",
  address: "",
};

/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(path, options = {}, token) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to backend. Make sure FastAPI is running at ${API_BASE}.`
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    if (Array.isArray(data?.detail)) {
      const message = data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return item?.msg || "Invalid input";
        })
        .join(", ");

      throw new Error(message);
    }

    if (typeof data?.detail === "string") {
      throw new Error(data.detail);
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  return data;
}

/* =========================================================
   NORMALIZE STUDENT
========================================================= */

function normalizeStudent(student) {
  if (!student || typeof student !== "object") {
    return null;
  }

  return {
    ...student,

    id:
      student.id ??
      student.student_id ??
      student.studentId ??
      "",

    name: student.name ?? student.student_name ?? "",
    email: student.email ?? "",
    phone: student.phone ?? student.phone_number ?? "",
    department: student.department ?? "",
    course: student.course ?? "",
    year: student.year ?? "",
    address: student.address ?? "",
  };
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
}) {
  return (
    <div className="student-field">
      <label className="student-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`student-input ${
          disabled ? "student-input-disabled" : ""
        }`}
      />
    </div>
  );
}

/* =========================================================
   STUDENT FORM
========================================================= */

function StudentForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitting,
  editing,
  editingId,
}) {
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <form className="student-form-card" onSubmit={onSubmit}>
      <div className="student-form-heading">
        <div>
          <h2>{editing ? "Edit Student" : "Add Student"}</h2>

          <p>
            {editing
              ? `Updating student ID ${editingId}`
              : "Enter the student's information below."}
          </p>
        </div>
      </div>

      {editing && (
        <div className="student-id-section">
          <label className="student-label">Student ID</label>

          <input
            type="text"
            value={editingId ?? ""}
            disabled
            className="student-input student-input-disabled"
          />
        </div>
      )}

      <div className="student-form-grid">
        <InputField
          label="Name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Enter student name"
          required
        />

        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="student@example.com"
          required
        />

        <InputField
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="Enter phone number"
          required
        />

        <InputField
          label="Department"
          value={form.department}
          onChange={(value) => updateField("department", value)}
          placeholder="e.g. Computer Science"
          required
        />

        <InputField
          label="Course"
          value={form.course}
          onChange={(value) => updateField("course", value)}
          placeholder="e.g. B.Tech"
          required
        />

        <InputField
          label="Year"
          type="number"
          value={form.year}
          onChange={(value) => updateField("year", value)}
          placeholder="e.g. 3"
          required
        />

        <div className="student-field student-full-width">
          <label className="student-label">
            Address
            <span className="required-star">*</span>
          </label>

          <textarea
            value={form.address ?? ""}
            onChange={(event) =>
              updateField("address", event.target.value)
            }
            placeholder="Enter student's address"
            rows={4}
            required
            className="student-textarea"
          />
        </div>
      </div>

      <div className="student-form-actions">
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="student-secondary-button"
            disabled={submitting}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="student-primary-button"
        >
          {submitting
            ? editing
              ? "Updating..."
              : "Adding..."
            : editing
            ? "Update Student"
            : "Add Student"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   STUDENT CARD
========================================================= */

function StudentCard({
  student,
  onEdit,
  onDelete,
  busy,
}) {
  return (
    <div className="student-card">
      <div className="student-card-top">
        <div className="student-card-title-area">
          <h3>{student.name || "Unnamed Student"}</h3>

          <span className="student-id-badge">
            ID: {student.id || "N/A"}
          </span>
        </div>

        <div className="student-card-actions">
          <button
            type="button"
            onClick={() => onEdit(student)}
            disabled={busy}
            className="student-edit-button"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(student)}
            disabled={busy}
            className="student-delete-button"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="student-card-details">
        <div className="student-detail">
          <span className="detail-label">Email</span>
          <span className="detail-value">
            {student.email || "-"}
          </span>
        </div>

        <div className="student-detail">
          <span className="detail-label">Phone</span>
          <span className="detail-value">
            {student.phone || "-"}
          </span>
        </div>

        <div className="student-detail">
          <span className="detail-label">Department</span>
          <span className="detail-value">
            {student.department || "-"}
          </span>
        </div>

        <div className="student-detail">
          <span className="detail-label">Course</span>
          <span className="detail-value">
            {student.course || "-"}
          </span>
        </div>

        <div className="student-detail">
          <span className="detail-label">Year</span>
          <span className="detail-value">
            {student.year || "-"}
          </span>
        </div>

        <div className="student-detail student-address-detail">
          <span className="detail-label">Address</span>
          <span className="detail-value">
            {student.address || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentManagement({
  token,
  email,
  onLogout,
}) {
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await apiRequest(
        "/students",
        {
          method: "GET",
        },
        token
      );

      let studentList = [];

      if (Array.isArray(data?.students)) {
        studentList = data.students;
      } else if (Array.isArray(data)) {
        studentList = data;
      } else if (Array.isArray(data?.data)) {
        studentList = data.data;
      }

      const normalizedStudents = studentList
        .map(normalizeStudent)
        .filter(Boolean);

      setStudents(normalizedStudents);
    } catch (error) {
      console.error("Loading students failed:", error);

      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  /* =======================================================
     ADD FORM
  ======================================================= */

  const openAddForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setFormError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     EDIT FORM
  ======================================================= */

  const openEditForm = (student) => {
    setForm({
      name: student.name ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      department: student.department ?? "",
      course: student.course ?? "",
      year:
        student.year !== null && student.year !== undefined
          ? String(student.year)
          : "",
      address: student.address ?? "",
    });

    setEditingId(student.id);
    setFormError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const name = String(form.name ?? "").trim();
    const emailValue = String(form.email ?? "").trim();
    const phone = String(form.phone ?? "").trim();
    const department = String(form.department ?? "").trim();
    const course = String(form.course ?? "").trim();
    const yearValue = String(form.year ?? "").trim();
    const address = String(form.address ?? "").trim();

    if (
      !name ||
      !emailValue ||
      !phone ||
      !department ||
      !course ||
      !yearValue ||
      !address
    ) {
      setFormError("Please fill in all fields.");
      return;
    }

    const year = Number(yearValue);

    if (!Number.isInteger(year) || year <= 0) {
      setFormError("Year must be a valid positive number.");
      return;
    }

    const studentData = {
      name,
      email: emailValue,
      phone,
      department,
      course,
      year,
      address,
    };

    setSubmitting(true);

    try {
      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingId !== null) {
        const data = await apiRequest(
          `/students/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(studentData),
          },
          token
        );

        const updatedStudent = normalizeStudent(
          data?.student || data
        );

        if (updatedStudent && updatedStudent.id !== "") {
          setStudents((previous) =>
            previous.map((student) =>
              String(student.id) === String(editingId)
                ? updatedStudent
                : student
            )
          );
        } else {
          await loadStudents();
        }

        closeForm();
      }

      /* =====================================================
         ADD
      ===================================================== */

      else {
        const data = await apiRequest(
          "/students",
          {
            method: "POST",
            body: JSON.stringify(studentData),
          },
          token
        );

        let createdStudent = null;

        if (Array.isArray(data?.student)) {
          createdStudent = data.student[0];
        } else if (data?.student) {
          createdStudent = data.student;
        } else if (data?.data) {
          createdStudent = data.data;
        } else if (data?.id || data?.student_id) {
          createdStudent = data;
        }

        createdStudent = normalizeStudent(createdStudent);

        if (createdStudent) {
          setStudents((previous) => [
            ...previous,
            createdStudent,
          ]);
        } else {
          await loadStudents();
        }

        closeForm();
      }
    } catch (error) {
      console.error(
        "Student operation failed:",
        error
      );

      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(student.id);

    try {
      await apiRequest(
        `/students/${student.id}`,
        {
          method: "DELETE",
        },
        token
      );

      setStudents((previous) =>
        previous.filter(
          (item) =>
            String(item.id) !== String(student.id)
        )
      );
    } catch (error) {
      console.error("Delete failed:", error);

      alert(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return students;
    }

    return students.filter((student) => {
      const values = [
        student.id,
        student.name,
        student.email,
        student.phone,
        student.department,
        student.course,
        student.year,
        student.address,
      ];

      return values.some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value)
            .toLowerCase()
            .includes(searchText)
      );
    });
  }, [students, search]);

  /* =======================================================
     WELCOME NAME
  ======================================================= */

  const welcomeName = email
    ? email.split("@")[0]
    : "Student";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <style>{`
        /* =================================================
           GLOBAL
        ================================================= */

        * {
          box-sizing: border-box;
        }

        html {
          background: #f5f7fa;
        }

        body {
          margin: 0;
          background: #f5f7fa;
          color: #1f2937;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        button {
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.1s ease,
            box-shadow 0.2s ease;
        }

        button:not(:disabled):active {
          transform: translateY(1px);
        }

        /* =================================================
           PAGE
        ================================================= */

        .student-page {
          min-height: 100vh;
          width: 100%;
          background: #f5f7fa;
          padding: 32px 24px 60px;
        }

        .student-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* =================================================
           HEADER
        ================================================= */

        .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          margin-bottom: 35px;
        }

        .student-header-center {
          flex: 1;
        }

        .student-title {
          margin: 0;
          font-size: 38px;
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.7px;
          color: #172033;
        }

        .student-subtitle {
          margin: 8px 0 0;
          font-size: 16px;
          color: #6b7280;
        }

        .student-header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .student-welcome {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
        }

        .student-logout {
          height: 42px;
          padding: 0 17px;
          border: 1px solid #d7dce3;
          border-radius: 9px;
          background: #ffffff;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
        }

        .student-logout:hover {
          background: #f8fafc;
          border-color: #c7ced8;
        }

        /* =================================================
           FORM CARD
        ================================================= */

        .student-form-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e1e5ea;
          border-radius: 14px;
          padding: 28px;
          margin-bottom: 35px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }

        .student-form-heading {
          margin-bottom: 25px;
        }

        .student-form-heading h2 {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
          color: #172033;
        }

        .student-form-heading p {
          margin: 7px 0 0;
          font-size: 14px;
          color: #6b7280;
        }

        .student-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .student-field {
          min-width: 0;
        }

        .student-full-width {
          grid-column: 1 / -1;
        }

        .student-id-section {
          margin-bottom: 20px;
        }

        /* =================================================
           LABEL
        ================================================= */

        .student-label {
          display: block;
          margin-bottom: 7px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .required-star {
          margin-left: 3px;
          color: #dc2626;
        }

        /* =================================================
           INPUTS
        ================================================= */

        .student-input {
          display: block;
          width: 100%;
          height: 46px;
          padding: 0 13px;
          border: 1px solid #d7dce3;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #1f2937;
          font-size: 15px;
        }

        .student-input::placeholder {
          color: #9ca3af;
        }

        .student-input:hover {
          border-color: #bfc7d2;
        }

        .student-input:focus {
          border-color: #4f7cff;
          box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.10);
        }

        .student-input-disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .student-textarea {
          display: block;
          width: 100%;
          min-height: 105px;
          padding: 12px 13px;
          border: 1px solid #d7dce3;
          border-radius: 8px;
          outline: none;
          resize: vertical;
          background: #ffffff;
          color: #1f2937;
          font-size: 15px;
          line-height: 1.5;
        }

        .student-textarea::placeholder {
          color: #9ca3af;
        }

        .student-textarea:focus {
          border-color: #4f7cff;
          box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.10);
        }

        /* =================================================
           FORM BUTTONS
        ================================================= */

        .student-form-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 25px;
        }

        .student-primary-button {
          min-height: 46px;
          padding: 0 22px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .student-primary-button:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
        }

        .student-primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .student-secondary-button {
          min-height: 46px;
          padding: 0 20px;
          border: 1px solid #d7dce3;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          font-size: 15px;
          cursor: pointer;
        }

        .student-secondary-button:hover {
          background: #f8fafc;
        }

        /* =================================================
           ERROR
        ================================================= */

        .student-error {
          margin-bottom: 22px;
          padding: 13px 15px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 14px;
        }

        .student-error-title {
          font-weight: 700;
          margin-bottom: 4px;
        }

        /* =================================================
           STUDENTS HEADER
        ================================================= */

        .student-list-section {
          width: 100%;
        }

        .student-list-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }

        .student-list-title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #172033;
        }

        .student-list-subtitle {
          margin: 5px 0 0;
          font-size: 14px;
          color: #6b7280;
        }

        .student-list-tools {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .student-search {
          width: 230px;
          height: 43px;
          padding: 0 13px;
          border: 1px solid #d7dce3;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #1f2937;
          font-size: 14px;
        }

        .student-search::placeholder {
          color: #9ca3af;
        }

        .student-search:focus {
          border-color: #4f7cff;
          box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.10);
        }

        .student-refresh {
          height: 43px;
          padding: 0 15px;
          border: 1px solid #d7dce3;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
        }

        .student-refresh:hover {
          background: #f8fafc;
        }

        .student-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =================================================
           ADD BUTTON
        ================================================= */

        .student-add-button {
          height: 43px;
          padding: 0 17px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .student-add-button:hover {
          background: #1d4ed8;
        }

        /* =================================================
           STUDENT CARDS
        ================================================= */

        .student-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .student-card {
          width: 100%;
          padding: 22px;
          background: #ffffff;
          border: 1px solid #e1e5ea;
          border-radius: 13px;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.035);
        }

        .student-card:hover {
          border-color: #d4dae2;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.05);
        }

        .student-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .student-card-title-area {
          min-width: 0;
        }

        .student-card-title-area h3 {
          margin: 0;
          font-size: 21px;
          line-height: 1.25;
          font-weight: 700;
          color: #172033;
          overflow-wrap: anywhere;
        }

        .student-id-badge {
          display: inline-block;
          margin-top: 6px;
          padding: 4px 9px;
          border-radius: 6px;
          background: #eef4ff;
          color: #3564c7;
          font-size: 12px;
          font-weight: 600;
        }

        /* =================================================
           CARD ACTIONS
        ================================================= */

        .student-card-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
          width: 82px;
        }

        .student-edit-button,
        .student-delete-button {
          width: 82px;
          height: 38px;
          border-radius: 7px;
          background: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }

        .student-edit-button {
          border: 1px solid #d7dce3;
          color: #374151;
        }

        .student-edit-button:hover {
          background: #f8fafc;
          border-color: #c5ccd6;
        }

        .student-delete-button {
          border: 1px solid #f0b8b8;
          color: #dc2626;
        }

        .student-delete-button:hover {
          background: #fff7f7;
          border-color: #e99b9b;
        }

        .student-edit-button:disabled,
        .student-delete-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* =================================================
           CARD DETAILS
        ================================================= */

        .student-card-details {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px 25px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #edf0f3;
        }

        .student-detail {
          min-width: 0;
        }

        .detail-label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #8b95a3;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .detail-value {
          display: block;
          font-size: 14px;
          line-height: 1.4;
          color: #374151;
          overflow-wrap: anywhere;
        }

        .student-address-detail {
          grid-column: span 2;
        }

        /* =================================================
           LOADING / EMPTY
        ================================================= */

        .student-message-card {
          width: 100%;
          padding: 50px 25px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e1e5ea;
          border-radius: 13px;
          color: #6b7280;
          font-size: 15px;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.03);
        }

        .student-retry-button {
          margin-top: 13px;
          height: 40px;
          padding: 0 16px;
          border: 1px solid #d7dce3;
          border-radius: 7px;
          background: #ffffff;
          color: #2563eb;
          font-size: 14px;
          cursor: pointer;
        }

        .student-retry-button:hover {
          background: #f5f8ff;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 900px) {
          .student-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .student-header-right {
            width: 100%;
            justify-content: space-between;
          }

          .student-list-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .student-list-tools {
            width: 100%;
          }

          .student-search {
            flex: 1;
            width: auto;
          }

          .student-card-details {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .student-address-detail {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .student-page {
            padding: 22px 14px 40px;
          }

          .student-title {
            font-size: 31px;
          }

          .student-form-card {
            padding: 20px;
          }

          .student-form-grid {
            grid-template-columns: 1fr;
          }

          .student-full-width {
            grid-column: auto;
          }

          .student-list-tools {
            flex-direction: column;
            align-items: stretch;
          }

          .student-search,
          .student-refresh,
          .student-add-button {
            width: 100%;
          }

          .student-card {
            padding: 18px;
          }

          .student-card-top {
            flex-direction: column;
          }

          .student-card-actions {
            width: 100%;
            flex-direction: row;
          }

          .student-edit-button,
          .student-delete-button {
            flex: 1;
            width: auto;
          }

          .student-card-details {
            grid-template-columns: 1fr;
          }

          .student-address-detail {
            grid-column: auto;
          }
        }

        @media (max-width: 480px) {
          .student-title {
            font-size: 27px;
          }

          .student-header-right {
            align-items: center;
          }

          .student-welcome {
            font-size: 14px;
          }

          .student-form-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .student-primary-button,
          .student-secondary-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="student-page">
        <div className="student-container">

          {/* HEADER */}

          <header className="student-header">
            <div className="student-header-center">
              <h1 className="student-title">
                Student Management
              </h1>

              <p className="student-subtitle">
                Manage student information easily
              </p>
            </div>

            <div className="student-header-right">
              <div className="student-welcome">
                Welcome, {welcomeName}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="student-logout"
              >
                Log out
              </button>
            </div>
          </header>

          {/* ADD / EDIT FORM */}

          {showForm && (
            <StudentForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
              editing={editingId !== null}
              editingId={editingId}
            />
          )}

          {/* FORM ERROR */}

          {formError && (
            <div className="student-error">
              <div className="student-error-title">
                Error
              </div>

              <div>
                {formError}
              </div>
            </div>
          )}

          {/* STUDENTS SECTION */}

          <section className="student-list-section">

            <div className="student-list-heading">

              <div>
                <h2 className="student-list-title">
                  Students
                </h2>

                <p className="student-list-subtitle">
                  {filteredStudents.length} student
                  {filteredStudents.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="student-list-tools">

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search students..."
                  className="student-search"
                />

                <button
                  type="button"
                  onClick={loadStudents}
                  className="student-refresh"
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="student-add-button"
                >
                  + Add Student
                </button>

              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <div className="student-message-card">
                Loading students...
              </div>
            )}

            {/* ERROR */}

            {!loading && loadError && (
              <div className="student-message-card">
                <strong>
                  Could not load students
                </strong>

                <div style={{ marginTop: "8px" }}>
                  {loadError}
                </div>

                <button
                  type="button"
                  onClick={loadStudents}
                  className="student-retry-button"
                >
                  Retry
                </button>
              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              !loadError &&
              filteredStudents.length === 0 && (
                <div className="student-message-card">
                  {search
                    ? "No students found matching your search."
                    : "No students available. Add your first student."}
                </div>
              )}

            {/* STUDENT CARDS */}

            {!loading &&
              !loadError &&
              filteredStudents.length > 0 && (
                <div className="student-cards">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      busy={
                        String(deletingId) ===
                        String(student.id)
                      }
                    />
                  ))}
                </div>
              )}

          </section>
        </div>
      </div>
    </>
  );
}