import React, { useState } from "react";
import { MOCK_MODE, API_BASE } from "./config";

// --- Mock auth (used only while MOCK_MODE is true) -------------------------
// Every phone number accepts the fixed code below — no real SMS is sent.
const MOCK_OTP_CODE = "123456";
const mockProfiles = new Map(); // phone -> name
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function mockSendOtp(phone) {
  await delay(400 + Math.random() * 300);
  if (!phone || !phone.trim()) {
    const err = new Error("Enter a phone number.");
    err.status = 422;
    throw err;
  }
  return { message: `OTP sent to ${phone}` };
}

async function mockVerifyOtp(phone, code, name) {
  await delay(400 + Math.random() * 300);
  if (code !== MOCK_OTP_CODE) {
    const err = new Error("Incorrect or expired code.");
    err.status = 401;
    throw err;
  }
  const resolvedName = (name && name.trim()) || mockProfiles.get(phone) || "";
  if (resolvedName) mockProfiles.set(phone, resolvedName);
  return {
    access_token: `mock-token-${phone}-${Date.now()}`,
    refresh_token: `mock-refresh-${phone}`,
    user_id: `mock-${phone}`,
    phone,
    name: resolvedName,
  };
}
// ---------------------------------------------------------------------------

async function authRequest(path, body) {
  if (MOCK_MODE) {
    try {
      if (path === "/send-otp") return await mockSendOtp(body.phone);
      if (path === "/verify-otp") return await mockVerifyOtp(body.phone, body.token, body.name);
      throw new Error(`Unhandled mock route: ${path}`);
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
  letterSpacing: 0.3,
};

export default function AuthScreen({ onLoggedIn, initialMessage }) {
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(initialMessage || null);

  const sendOtpTo = async (trimmedPhone) => {
    setSubmitting(true);
    setError(null);
    try {
      await authRequest("/send-otp", { phone: trimmedPhone });
      setInfo(`Code sent to ${trimmedPhone}.` + (MOCK_MODE ? ` (mock code: ${MOCK_OTP_CODE})` : ""));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Enter a phone number.");
      return;
    }
    // Basic sanity check — full validation happens server-side.
    if (!/^\+?[0-9\s-]{7,15}$/.test(trimmed)) {
      setError("Enter a valid phone number, including country code (e.g. +91XXXXXXXXXX).");
      return;
    }

    const ok = await sendOtpTo(trimmed);
    if (ok) setStep("otp");
  };

  const handleResendOtp = async () => {
    setInfo(null);
    await sendOtpTo(phone.trim());
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!otp.trim()) {
      setError("Enter the code you received.");
      return;
    }
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await authRequest("/verify-otp", {
        phone: phone.trim(),
        token: otp.trim(),
        name: name.trim() || undefined,
      });
      onLoggedIn({ token: data.access_token, phone: data.phone || phone.trim(), name: data.name || name.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const backToPhone = () => {
    setStep("phone");
    setOtp("");
    setName("");
    setError(null);
    setInfo(null);
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
          {step === "phone" ? "Log in" : "Enter code"}
        </h1>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                autoComplete="tel"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
              />
            </div>

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
              {submitting ? "Sending code…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, color: "#6B6558" }}>
              Code sent to <strong>{phone.trim()}</strong>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                style={{ ...inputStyle, fontSize: 20, letterSpacing: 6, textAlign: "center" }}
                onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sai"
                autoComplete="name"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
              />
            </div>

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
              {submitting ? "Verifying…" : "Verify & log in"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <button
                type="button"
                onClick={backToPhone}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6B6558",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  font: "inherit",
                  fontSize: 13.5,
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={submitting}
                style={{
                  background: "none",
                  border: "none",
                  color: submitting ? "#C99A6B" : "#B45309",
                  fontWeight: 600,
                  cursor: submitting ? "default" : "pointer",
                  padding: 0,
                  font: "inherit",
                  fontSize: 13.5,
                }}
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}