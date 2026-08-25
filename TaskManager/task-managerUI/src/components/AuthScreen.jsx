import React, { useState } from "react";
import { MOCK_MODE, API_BASE } from "./config";

// --- Mock auth (used only while MOCK_MODE is true) -------------------------
// Every phone number accepts the fixed code below — no real SMS is sent.
const MOCK_OTP_CODE = "123456";
const mockProfiles = new Map(); // phone -> name (only set once a name has been collected)
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
  const existingName = mockProfiles.get(phone);
  const providedName = name && name.trim();

  if (providedName) mockProfiles.set(phone, providedName);

  const resolvedName = providedName || existingName || "";
  const isNewUser = !existingName && !providedName; // no name on file yet, and none given this call

  return {
    access_token: `mock-token-${phone}-${Date.now()}`,
    refresh_token: `mock-refresh-${phone}`,
    user_id: `mock-${phone}`,
    phone,
    name: resolvedName,
    is_new_user: isNewUser,
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

const primaryButtonStyle = (submitting) => ({
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
});

const textButtonStyle = (color = "#B45309") => ({
  background: "none",
  border: "none",
  color,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  font: "inherit",
  fontSize: 13.5,
});

export default function AuthScreen({ onLoggedIn, initialMessage }) {
  const [step, setStep] = useState("phone"); // "phone" | "otp" | "name"
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

  // Step 2: verify the code only — no name sent yet.
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!otp.trim()) {
      setError("Enter the code you received.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await authRequest("/verify-otp", { phone: phone.trim(), token: otp.trim() });
      if (data.is_new_user) {
        setStep("name");
      } else {
        onLoggedIn({ token: data.access_token, phone: data.phone || phone.trim(), name: data.name || "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 (only for new users): verify again, this time including the name.
  const handleSubmitName = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await authRequest("/verify-otp", {
        phone: phone.trim(),
        token: otp.trim(),
        name: name.trim(),
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

  const backToOtp = () => {
    setStep("otp");
    setName("");
    setError(null);
    setInfo(null);
  };

  const titles = { phone: "Log in", otp: "Enter code", name: "What's your name?" };

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
        <h1 style={{ fontSize: 26, margin: "0 0 20px", fontWeight: 600, letterSpacing: -0.3 }}>{titles[step]}</h1>

        {step === "phone" && (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 }}>
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Your Number"
                autoComplete="tel"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#B45309")}
                onBlur={(e) => (e.target.style.borderColor = "#DAD5C7")}
              />
            </div>

            {error && <div style={{ fontSize: 13, color: "#B4332F" }}>{error}</div>}
            {info && <div style={{ fontSize: 13, color: "#166534" }}>{info}</div>}

            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Sending code…" : "Send code"}
            </button>
          </form>
        )}

        {step === "otp" && (
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

            {error && <div style={{ fontSize: 13, color: "#B4332F" }}>{error}</div>}
          

            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Verifying…" : "Verify"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <button type="button" onClick={backToPhone} style={textButtonStyle("#6B6558")}>
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={submitting}
                style={textButtonStyle(submitting ? "#C99A6B" : "#B45309")}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleSubmitName} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, color: "#6B6558" }}>
              First time here — what should we call you?
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
            

            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Saving…" : "Continue"}
            </button>

            <button type="button" onClick={backToOtp} style={{ ...textButtonStyle("#6B6558"), textAlign: "center" }}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}