import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getSupabaseForUser } from "@/lib/supabase";
import type { ApiError, VerifyOtpResponse } from "@/lib/types";

// POST /api/verify-otp
// Body: { phone: string, token: string, name?: string }
// Equivalent to Sai's @app.post("/verify-otp") in FastAPI —
// with one real fix: we check whether a profile already exists
// BEFORE writing anything, so `is_new_user` reflects the state
// prior to this call, and we actually include it in the response
// (his Python version computed it nowhere and never returned it).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { phone, token, name } = (body ?? {}) as {
    phone?: string;
    token?: string;
    name?: string;
  };

  if (!phone || !token) {
    const error: ApiError = { detail: "phone and token are required" };
    return NextResponse.json(error, { status: 422 });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error || !data.session || !data.user) {
    const apiError: ApiError = {
      detail: `OTP verification failed: ${error?.message ?? "Invalid or expired OTP"}`,
    };
    return NextResponse.json(apiError, { status: 401 });
  }

  const user = data.user;
  const accessToken = data.session.access_token;
  const userSupabase = getSupabaseForUser(accessToken);

  // Check FIRST, before any write — this is the order Sai's version got wrong.
  const existingProfile = await userSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const hadProfileBefore = !!existingProfile.data;
  const providedName = name && name.trim() ? name.trim() : null;

  if (providedName) {
    await userSupabase.from("profiles").upsert({
      id: user.id,
      phone: user.phone,
      name: providedName,
    });
  }

  const resolvedName = providedName ?? existingProfile.data?.name ?? "";

  // New only if there was no profile before this call AND no name
  // was supplied to complete it just now.
  const isNewUser = !hadProfileBefore && !providedName;

  const response: VerifyOtpResponse = {
    access_token: accessToken,
    refresh_token: data.session.refresh_token,
    user_id: user.id,
    phone: user.phone ?? phone,
    name: resolvedName,
    is_new_user: isNewUser,
  };

  return NextResponse.json(response);
}