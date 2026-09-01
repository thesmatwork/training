"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadSession, clearSession } from "@/lib/session";
import type { Task, ApiError, Profile } from "@/lib/types";

const STATUSES = ["pending", "in_progress", "completed"];

const STATUS_STYLES: Record<string, { label: string; dot: string; bg: string; fg: string }> = {
  pending: { label: "Pending", dot: "#B45309", bg: "#FEF3E2", fg: "#92400E" },
  in_progress: { label: "In progress", dot: "#1D4ED8", bg: "#EAF0FE", fg: "#1E40AF" },
  completed: { label: "Completed", dot: "#15803D", bg: "#E8F6EC", fg: "#166534" },
};

async function apiRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  if (res.status === 401) throw new Error("__UNAUTHORIZED__");

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err?.detail || `Request failed (${res.status})`);
  }
  return data as T;
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const markBusy = (id: number, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const handleLogout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setToken(session.token);
    setName(session.name);
  }, [router]);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiRequest<Task[]>("/api/tasks", token);
      setTasks(data);
    } catch (err) {
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") {
        handleLogout();
        return;
      }
      setLoadError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await apiRequest<Profile>("/api/profile", token);
      if (profile?.name) setName(profile.name);
    } catch (err) {
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") handleLogout();
    }
  }, [token, handleLogout]);

  useEffect(() => {
    if (!token) return;
    loadTasks();
    loadProfile();
  }, [token, loadTasks, loadProfile]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Give the task a title.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await apiRequest<Task>("/api/tasks", token, {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle, description: description.trim() || undefined }),
      });
      setTasks((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
    } catch (err) {
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") {
        handleLogout();
        return;
      }
      setFormError(err instanceof Error ? err.message : "Failed to add task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task: Task, status: string) => {
    if (!token || status === task.status) return;
    markBusy(task.id, true);
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const updated = await apiRequest<Task>(`/api/tasks/${task.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setTasks(prevTasks);
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") handleLogout();
    } finally {
      markBusy(task.id, false);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!token) return;
    markBusy(task.id, true);
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await apiRequest(`/api/tasks/${task.id}`, token, { method: "DELETE" });
    } catch (err) {
      setTasks(prevTasks);
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") handleLogout();
    } finally {
      markBusy(task.id, false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const saveEdit = async (task: Task) => {
    if (!token) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    markBusy(task.id, true);
    try {
      const updated = await apiRequest<Task>(`/api/tasks/${task.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ title: trimmedTitle, description: editDescription.trim() }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setEditingId(null);
    } catch (err) {
      if (err instanceof Error && err.message === "__UNAUTHORIZED__") handleLogout();
    } finally {
      markBusy(task.id, false);
    }
  };

  const remaining = tasks.filter((t) => t.status !== "completed").length;

  if (!token) return null;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Task board</h1>
            <p style={subtitleStyle}>{loading ? "Loading tasks…" : `${remaining} open of ${tasks.length} total`}</p>
            <p></p>
          </div>
          <div style={headerRightStyle}>
            {name && <div style={welcomeStyle}>Welcome, {name}</div>}
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Log out
            </button>
          </div>
        </header>

        <form onSubmit={handleAdd} style={formCardStyle}>
          <div style={formFieldsStyle}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              style={inputStyle}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details (optional)"
              rows={2}
              style={textareaStyle}
            />
            <div style={formFooterStyle}>
              <span style={formErrorStyle}>{formError}</span>
              <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
                {submitting ? "Adding…" : "Add task"}
              </button>
            </div>
          </div>
        </form>

        {loading && <p style={loadingTextStyle}>Loading…</p>}

        {!loading && loadError && (
          <div style={errorBoxStyle}>
            <strong style={errorTitleStyle}>Couldn&apos;t load tasks</strong>
            {loadError}
            <div style={retryWrapStyle}>
              <button onClick={loadTasks} style={retryButtonStyle}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !loadError && tasks.length === 0 && (
          <div style={emptyStateStyle}>Nothing on the board yet. Add your first task above.</div>
        )}

        {!loading &&
          !loadError &&
          tasks.map((task) => {
            const busy = busyIds.has(task.id);
            const isEditing = editingId === task.id;
            const statusInfo = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
            return (
              <div key={task.id} style={{ ...taskCardStyle, opacity: busy ? 0.6 : 1 }}>
                {isEditing ? (
                  <div style={editFormStyle}>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      style={textareaStyle}
                    />
                    <div style={editActionsStyle}>
                      <button onClick={() => setEditingId(null)} style={cancelButtonStyle}>
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(task)} style={saveButtonStyle}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={taskRowStyle}>
                    <div style={taskMainStyle}>
                      <span style={taskTitleStyle}>{task.title}</span>
                      {task.description && <p style={taskDescStyle}>{task.description}</p>}
                      <div style={statusRowStyle}>
                        <span style={{ ...statusPillStyle, background: statusInfo.bg, color: statusInfo.fg }}>
                          <span style={{ ...statusDotStyle, background: statusInfo.dot }} />
                          {statusInfo.label}
                        </span>
                        <select
                          value={task.status}
                          disabled={busy}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          style={selectStyle}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_STYLES[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={taskActionsStyle}>
                      <button onClick={() => startEdit(task)} disabled={busy} style={smallButtonStyle}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(task)} disabled={busy} style={deleteButtonStyle}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles (kept at the end of the file, same convention as the old TaskBoard)
// ---------------------------------------------------------------------------

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F7F5EF",
  fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  color: "#1C1B18",
  padding: "40px 20px 80px",
};

const containerStyle: React.CSSProperties = { maxWidth: 640, margin: "0 auto" };

const headerStyle: React.CSSProperties = {
  marginBottom: 28,
  display: "center",
  justifyContent: "space-between",
  alignItems: "flex-start",
  textAlign: "center"
};

const titleStyle: React.CSSProperties = { fontSize: 32, margin: 0, fontWeight: 600, letterSpacing: -0.3 };

const subtitleStyle: React.CSSProperties = { margin: "6px 0 0", fontSize: 14, color: "#6B6558" };

const welcomeStyle: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 600,
  color: "#3A362C",
  marginBottom: 6,
};

const logoutButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 12.5,
  padding: "5px 12px",
  borderRadius: 7,
  border: "1px solid #DAD5C7",
  background: "transparent",
  color: "#5C5749",
  cursor: "pointer",
};

const formCardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E4E0D4",
  borderRadius: 14,
  padding: 18,
  marginBottom: 28,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 16,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #DAD5C7",
  outline: "none",
  background: "#FBFAF6",
  width: "100%",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  fontSize: 14,
  resize: "vertical",
};

const primaryButtonStyle = (submitting: boolean): React.CSSProperties => ({
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  padding: "9px 18px",
  borderRadius: 8,
  border: "none",
  background: submitting ? "#C99A6B" : "#B45309",
  color: "#FFF8EF",
  cursor: submitting ? "default" : "pointer",
});

const errorBoxStyle: React.CSSProperties = {
  border: "1px solid #E6C7C4",
  background: "#FBF1F0",
  color: "#7A2E29",
  borderRadius: 12,
  padding: "16px 18px",
  fontSize: 14,
};

const retryButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  padding: "6px 14px",
  borderRadius: 7,
  border: "1px solid #C97A74",
  background: "transparent",
  color: "#7A2E29",
  cursor: "pointer",
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "48px 20px",
  color: "#8A8371",
  border: "1px dashed #D8D2C2",
  borderRadius: 12,
};

const taskCardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E4E0D4",
  borderRadius: 12,
  padding: 16,
  marginBottom: 10,
  transition: "opacity 0.15s",
};

const taskTitleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 600, overflowWrap: "anywhere" };

const taskDescStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13.5,
  color: "#5C5749",
  lineHeight: 1.45,
  overflowWrap: "anywhere",
};

const selectStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 12.5,
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid #DAD5C7",
  background: "#FBFAF6",
  cursor: "pointer",
};

const smallButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 12,
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid #DAD5C7",
  background: "transparent",
  color: "#5C5749",
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  border: "1px solid #E6C7C4",
  color: "#B4332F",
};

const cancelButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  padding: "6px 12px",
  borderRadius: 7,
  border: "1px solid #DAD5C7",
  background: "transparent",
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 600,
  padding: "6px 14px",
  borderRadius: 7,
  border: "none",
  background: "#1C2A22",
  color: "#F5F1E8",
  cursor: "pointer",
};

const headerRightStyle: React.CSSProperties = { textAlign: "right", flexShrink: 0, marginLeft: 12 };

const formFieldsStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10 };

const formFooterStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };

const formErrorStyle: React.CSSProperties = { fontSize: 12.5, color: "#B4332F", minHeight: 16 };

const loadingTextStyle: React.CSSProperties = { color: "#8A8371" };

const errorTitleStyle: React.CSSProperties = { display: "block", marginBottom: 4 };

const retryWrapStyle: React.CSSProperties = { marginTop: 10 };

const editFormStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };

const editActionsStyle: React.CSSProperties = { display: "flex", gap: 8, justifyContent: "flex-end" };

const taskRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12 };

const taskMainStyle: React.CSSProperties = { minWidth: 0 };

const statusRowStyle: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const statusPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
};

const statusDotStyle: React.CSSProperties = { width: 6, height: 6, borderRadius: "50%" };

const taskActionsStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 };