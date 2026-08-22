import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "http://192.168.1.13:8000";

// Flip to false once Sai's backend is reachable at API_BASE.
// While true, all requests are served from an in-memory mock that
// mirrors the real API's shapes and error cases (404 / 422 / 500),
// so the UI can be exercised without the FastAPI server running.
const MOCK_MODE = false;

const STATUSES = ["pending", "in progress", "done"];

const STATUS_STYLES = {
  pending: { label: "Pending", dot: "#B45309", bg: "#FEF3E2", fg: "#92400E" },
  "in progress": { label: "In progress", dot: "#1D4ED8", bg: "#EAF0FE", fg: "#1E40AF" },
  done: { label: "Done", dot: "#15803D", bg: "#E8F6EC", fg: "#166534" },
};

function relativeTime(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

// --- Mock backend (used only while MOCK_MODE is true) ---------------------
let mockTasks = [
  {
    id: 1,
    title: "Finish backend API",
    description: "Add CRUD endpoints for tasks",
    status: "done",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    title: "Wire up frontend",
    description: "Connect React UI to /tasks endpoints",
    status: "in progress",
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 3,
    title: "Ask Sai about CORS",
    description: "",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];
let mockNextId = 4;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function mockApiRequest(path, options = {}) {
  await delay(350 + Math.random() * 300); // simulate network latency
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : undefined;

  const notFound = () => {
    const err = new Error("That task no longer exists.");
    err.status = 404;
    throw err;
  };

  if (path === "/tasks" && method === "GET") {
    return JSON.parse(JSON.stringify(mockTasks));
  }

  if (path === "/tasks" && method === "POST") {
    if (!body?.title || !body.title.trim()) {
      const err = new Error("title: field required");
      err.status = 422;
      throw err;
    }
    const task = {
      id: mockNextId++,
      title: body.title.trim(),
      description: body.description || "",
      status: body.status || "pending",
      created_at: new Date().toISOString(),
    };
    mockTasks.push(task);
    return task;
  }

  const idMatch = path.match(/^\/tasks\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const idx = mockTasks.findIndex((t) => t.id === id);

    if (method === "GET") {
      if (idx === -1) notFound();
      return mockTasks[idx];
    }
    if (method === "PUT") {
      if (idx === -1) notFound();
      if (body?.title !== undefined && !body.title.trim()) {
        const err = new Error("title: field cannot be empty");
        err.status = 422;
        throw err;
      }
      mockTasks[idx] = { ...mockTasks[idx], ...body };
      return mockTasks[idx];
    }
    if (method === "DELETE") {
      if (idx === -1) notFound();
      mockTasks.splice(idx, 1);
      return { message: `Task ${id} deleted successfully` };
    }
  }

  const err = new Error(`Unhandled mock route: ${method} ${path}`);
  err.status = 500;
  throw err;
}
// ---------------------------------------------------------------------------

async function apiRequest(path, options) {
  if (MOCK_MODE) {
    try {
      return await mockApiRequest(path, options);
    } catch (err) {
      if (err.status === 404) throw new Error("That task no longer exists.");
      if (err.status === 422) throw new Error(err.message);
      throw new Error("The server hit an error. Try again in a moment.");
    }
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new Error(
      "Can't reach the backend. Make sure it's running at " + API_BASE + " (and check for CORS errors in the console)."
    );
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (res.status === 404) detail = "That task no longer exists.";
      else if (res.status === 422) {
        detail = Array.isArray(body.detail)
          ? body.detail.map((d) => d.msg).join(", ")
          : body.detail || "That input isn't valid.";
      } else if (res.status === 500) detail = "The server hit an error. Try again in a moment.";
      else if (body?.detail) detail = body.detail;
    } catch (_) {
      // no JSON body, keep default detail
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        background: s.bg,
        color: s.fg,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function Toast({ message, kind, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
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
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 13.5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 100,
        maxWidth: 420,
        textAlign: "center",
      }}
      role="status"
    >
      {message}
    </div>
  );
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [busyIds, setBusyIds] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const showToast = (message, kind = "info") => setToast({ message, kind });

  const markBusy = (id, on) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiRequest("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Give the task a title.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const body = { title: trimmedTitle };
      if (description.trim()) body.description = description.trim();
      const created = await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setTasks((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      showToast(`Added "${created.title}"`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    if (status === task.status) return;
    markBusy(task.id, true);
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const updated = await apiRequest(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setTasks(prevTasks);
      showToast(err.message, "error");
    } finally {
      markBusy(task.id, false);
    }
  };

  const handleDelete = async (task) => {
    markBusy(task.id, true);
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await apiRequest(`/tasks/${task.id}`, { method: "DELETE" });
      showToast(`Deleted "${task.title}"`);
    } catch (err) {
      setTasks(prevTasks);
      showToast(err.message, "error");
    } finally {
      markBusy(task.id, false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (task) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      showToast("Title can't be empty.", "error");
      return;
    }
    markBusy(task.id, true);
    try {
      const updated = await apiRequest(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: trimmedTitle, description: editDescription.trim() }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setEditingId(null);
      showToast("Task updated");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      markBusy(task.id, false);
    }
  };

  const remaining = tasks.filter((t) => t.status !== "done").length;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F7F5EF",
        fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
        color: "#1C1B18",
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <header style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#8A8371",
              marginBottom: 6,
            }}
          >
            Ledger &middot; local backend
          </div>
          <h1 style={{ fontSize: 32, margin: 0, fontWeight: 600, letterSpacing: -0.3 }}>Task board</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6B6558" }}>
            {loading ? "Loading tasks…" : `${remaining} open of ${tasks.length} total`}
          </p>
        </header>

        <form
          onSubmit={handleAdd}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E4E0D4",
            borderRadius: 14,
            padding: 18,
            marginBottom: 28,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              aria-label="Task title"
              style={{
                fontFamily: "inherit",
                fontSize: 16,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #DAD5C7",
                outline: "none",
                background: "#FBFAF6",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#B45309")}
              onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details (optional)"
              aria-label="Task description"
              rows={2}
              style={{
                fontFamily: "inherit",
                fontSize: 14,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #DAD5C7",
                outline: "none",
                resize: "vertical",
                background: "#FBFAF6",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#B45309")}
              onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "#B4332F", minHeight: 16 }}>{formError}</span>
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
                  background: submitting ? "#C99A6B" : "#B45309",
                  color: "#FFF8EF",
                  cursor: submitting ? "default" : "pointer",
                }}
              >
                {submitting ? "Adding…" : "Add task"}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 64,
                  borderRadius: 12,
                  background: "linear-gradient(90deg, #EFEBDF 25%, #F5F2E8 37%, #EFEBDF 63%)",
                  backgroundSize: "400% 100%",
                  animation: "shimmer 1.4s ease infinite",
                }}
              />
            ))}
            <style>{`@keyframes shimmer {0%{background-position:100% 0}100%{background-position:0 0}}`}</style>
          </div>
        )}

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
            <strong style={{ display: "block", marginBottom: 4 }}>Couldn't load tasks</strong>
            {loadError}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={loadTasks}
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

        {!loading && !loadError && tasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#8A8371",
              border: "1px dashed #D8D2C2",
              borderRadius: 12,
            }}
          >
            Nothing on the board yet. Add your first task above.
          </div>
        )}

        {!loading && !loadError && tasks.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task) => {
              const busy = busyIds.has(task.id);
              const isEditing = editingId === task.id;
              return (
                <li
                  key={task.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4E0D4",
                    borderRadius: 12,
                    padding: 16,
                    opacity: busy ? 0.6 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          fontFamily: "inherit",
                          fontSize: 15,
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid #DAD5C7",
                        }}
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        style={{
                          fontFamily: "inherit",
                          fontSize: 13.5,
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: "1px solid #DAD5C7",
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={cancelEdit}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 13,
                            padding: "6px 12px",
                            borderRadius: 7,
                            border: "1px solid #DAD5C7",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(task)}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "6px 14px",
                            borderRadius: 7,
                            border: "none",
                            background: "#1C2A22",
                            color: "#F5F1E8",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{task.title}</span>
                          <span style={{ fontSize: 11.5, color: "#A6A08E" }}>{relativeTime(task.created_at)}</span>
                        </div>
                        {task.description && (
                          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5C5749", lineHeight: 1.45 }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <StatusPill status={task.status} />
                          <select
                            value={task.status}
                            disabled={busy}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            aria-label={`Change status for ${task.title}`}
                            style={{
                              fontFamily: "inherit",
                              fontSize: 12.5,
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #DAD5C7",
                              background: "#FBFAF6",
                              cursor: busy ? "default" : "pointer",
                            }}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_STYLES[s].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => startEdit(task)}
                          disabled={busy}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 12,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "1px solid #DAD5C7",
                            background: "transparent",
                            color: "#5C5749",
                            cursor: busy ? "default" : "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          disabled={busy}
                          style={{
                            fontFamily: "inherit",
                            fontSize: 12,
                            padding: "5px 10px",
                            borderRadius: 6,
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
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}
    </div>
  );
}