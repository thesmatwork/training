import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import type { ApiError } from "@/lib/types";

// POST /api/send-otp
// Body: { phone: string }
// Equivalent to Sai's @app.post("/send-otp") in FastAPI.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const phone: string | undefined = body?.phone;

  if (!phone || typeof phone !== "string" || !phone.trim()) {
    const error: ApiError = { detail: "phone is required" };
    return NextResponse.json(error, { status: 422 });
  }

  const supabase = getServiceClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone: phone.trim(),
    options: { channel: "sms" },
  });

  if (error) {
    const apiError: ApiError = { detail: `Failed to send OTP: ${error.message}` };
    return NextResponse.json(apiError, { status: 400 });
  }

  return NextResponse.json({ message: `OTP sent to ${phone.trim()}` });
}