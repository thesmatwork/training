import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

// Keep this in sync with MOCK_MODE in TaskBoard.jsx — both should flip
// to false together once Sai's auth endpoints are live.
const MOCK_MODE = true;

// --- Mock auth (used only while MOCK_MODE is true) -------------------------
const mockUsers = new Map(); // email -> password
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function mockAuthRequest(path, body) {
  await delay(300 + Math.random() * 300);

  if (path === "/register") {
    if (!body.email || !body.password) {
      const err = new Error("email and password are required");
      err.status = 422;
      throw err;
    }
    if (body.password.length < 6) {
      const err = new Error("password must be at least 6 characters");
      err.status = 422;
      throw err;
    }
    if (mockUsers.has(body.email)) {
      const err = new Error("An account with that email already exists.");
      err.status = 400;
      throw err;
    }
    mockUsers.set(body.email, body.password);
    return { message: "Registered successfully", user_id: `mock-${body.email}`, email: body.email };
  }

  if (path === "/login") {
    const stored = mockUsers.get(body.email);
    if (!stored || stored !== body.password) {
      const err = new Error("Incorrect email or password.");
      err.status = 401;
      throw err;
    }
    return {
      access_token: `mock-token-${body.email}-${Date.now()}`,
      refresh_token: `mock-refresh-${body.email}`,
      user_id: `mock-${body.email}`,
      email: body.email,
    };
  }

  const err = new Error(`Unhandled mock route: ${path}`);
  err.status = 500;
  throw err;
}
// ---------------------------------------------------------------------------

async function authRequest(path, body) {
  if (MOCK_MODE) {
    try {
      return await mockAuthRequest(path, body);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      "Can't reach the backend. Make sure it's running at " + API_BASE + " (and check for CORS errors in the console)."
    );
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg).join(", ")
        : data.detail || detail;
    } catch (_) {
      // no JSON body
    }
    throw new Error(detail);
  }

  return res.json();
}

const inputStyle = {
  fontFamily: "inherit",
  fontSize: 15,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #DAD5C7",
  outline: "none",
  background: "#FBFAF6",
  width: "100%",
  boxSizing: "border-box",
};

function EyeToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        padding: 4,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        color: "#8A8371",
      }}
    >
      {shown ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

export default function AuthScreen({ onLoggedIn, initialMessage }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(initialMessage || null);

  const switchMode = (next) => {
  setMode(next);
  setError(null);
  setInfo(null);
  setPassword("");
  setConfirmPassword("");
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        await authRequest("/register", { email: email.trim(), password });
        setInfo("Account created — you can log in now.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        const data = await authRequest("/login", { email: email.trim(), password });
        onLoggedIn({ token: data.access_token, email: data.email || email.trim() });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F7F5EF",
        fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
        color: "#1C1B18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#FFFFFF",
          border: "1px solid #E4E0D4",
          borderRadius: 14,
          padding: 28,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <h1 style={{ fontSize: 26, margin: "0 0 20px", fontWeight: 600, letterSpacing: -0.3 }}>
          {mode === "login" ? "Log in" : "Create an account"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#B45309")}
              onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={{ ...inputStyle, paddingRight: 38 }}
                onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
              />
              <EyeToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>Re-enter password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: 38 }}
                  onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                  onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
                />
                <EyeToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: 13, color: "#B4332F" }}>{error}</div>}
          {info && <div style={{ fontSize: 13, color: "#166534" }}>{info}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: submitting ? "#C99A6B" : "#B45309",
              color: "#FFF8EF",
              cursor: submitting ? "default" : "pointer",
              marginTop: 4,
            }}
          >
            {submitting ? (mode === "login" ? "Logging in…" : "Creating account…") : mode === "login" ? "Log in" : "Register"}
          </button>
        </form>

        <div style={{ marginTop: 18, fontSize: 13.5, textAlign: "center", color: "#6B6558" }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("register")}
                style={{ background: "none", border: "none", color: "#B45309", fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                style={{ background: "none", border: "none", color: "#B45309", fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}