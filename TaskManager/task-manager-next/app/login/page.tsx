"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/session";
import type { VerifyOtpResponse, ApiError } from "@/lib/types";

type Step = "phone" | "otp" | "name";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return data as T;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sendOtpTo = async (trimmedPhone: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await postJson<{ message: string }>("/api/send-otp", { phone: trimmedPhone });
      setInfo(`Code sent to ${trimmedPhone}.`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = phone.trim();
    if (!trimmed) {
      setError("Enter a phone number.");
      return;
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(trimmed)) {
      setError("Enter a valid phone number (e.g. +91XXXXXXXXXX).");
      return;
    }
    const ok = await sendOtpTo(trimmed);
    if (ok) setStep("otp");
  };

  const handleResendOtp = async () => {
    setInfo(null);
    await sendOtpTo(phone.trim());
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!otp.trim()) {
      setError("Enter the code you received.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await postJson<VerifyOtpResponse>("/api/verify-otp", {
        phone: phone.trim(),
        token: otp.trim(),
      });
      if (data.is_new_user) {
        setStep("name");
      } else {
        saveSession({ token: data.access_token, phone: data.phone, name: data.name });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await postJson<VerifyOtpResponse>("/api/verify-otp", {
        phone: phone.trim(),
        token: otp.trim(),
        name: name.trim(),
      });
      saveSession({ token: data.access_token, phone: data.phone, name: data.name });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
  };

  const titles: Record<Step, string> = { phone: "Log in", otp: "Enter code", name: "What's your name?" };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{titles[step]}</h1>

        {step === "phone" && (
          <form onSubmit={handleSendOtp} style={formStyle}>
            <div>
              <label style={labelStyle}>Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                autoComplete="tel"
                style={inputStyle}
              />
            </div>
            {error && <div style={errorTextStyle}>{error}</div>}
            {info && <div style={infoTextStyle}>{info}</div>}
            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Sending code…" : "Send code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={formStyle}>
            <div style={helperTextStyle}>
              Code sent to <strong>{phone.trim()}</strong>
            </div>
            <div>
              <label style={labelStyle}>Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                style={otpInputStyle}
              />
            </div>
            {error && <div style={errorTextStyle}>{error}</div>}
            {info && <div style={infoTextStyle}>{info}</div>}
            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Verifying…" : "Verify"}
            </button>
            <div style={backResendRowStyle}>
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
          <form onSubmit={handleSubmitName} style={formStyle}>
            <div style={helperTextStyle}>First time here — what should we call you?</div>
            <div>
              <label style={labelStyle}>Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sai"
                autoComplete="name"
                style={inputStyle}
              />
            </div>
            {error && <div style={errorTextStyle}>{error}</div>}
            <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
              {submitting ? "Saving…" : "Continue"}
            </button>
            <button type="button" onClick={backToOtp} style={nameBackButtonStyle}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles (kept at the end of the file, same convention as the old AuthScreen)
// ---------------------------------------------------------------------------

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F7F5EF",
  fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  color: "#1C1B18",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "#FFFFFF",
  border: "1px solid #E4E0D4",
  borderRadius: 14,
  padding: 28,
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};

const titleStyle: React.CSSProperties = { fontSize: 26, margin: "0 0 20px", fontWeight: 600, letterSpacing: -0.3,textAlign:"center" };

const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12.5, color: "#6B6558", marginBottom: 4 };

const inputStyle: React.CSSProperties = {
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

const otpInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontSize: 20,
  letterSpacing: 6,
  textAlign: "center",
};

const errorTextStyle: React.CSSProperties = { fontSize: 13, color: "#B4332F" };

const infoTextStyle: React.CSSProperties = { fontSize: 13, color: "#166534" };

const primaryButtonStyle = (submitting: boolean): React.CSSProperties => ({
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

const textButtonStyle = (color = "#B45309"): React.CSSProperties => ({
  background: "none",
  border: "none",
  color,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  font: "inherit",
  fontSize: 13.5,
});

const helperTextStyle: React.CSSProperties = { fontSize: 13.5, color: "#6B6558" };

const backResendRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: 2 };

const nameBackButtonStyle: React.CSSProperties = { ...textButtonStyle("#6B6558"), textAlign: "center" };