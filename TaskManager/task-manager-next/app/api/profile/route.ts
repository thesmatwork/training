import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";
import type { ApiError } from "@/lib/types";

// GET /api/profile
export async function GET(request: NextRequest) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user, token } = authResult;

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    const apiError: ApiError = { detail: "Profile not found" };
    return NextResponse.json(apiError, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/profile
// Body: { name: string }
export async function PUT(request: NextRequest) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user, token } = authResult;

  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name;

  if (!name || !name.trim()) {
    const error: ApiError = { detail: "name is required" };
    return NextResponse.json(error, { status: 422 });
  }

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("profiles")
    .update({ name: name.trim() })
    .eq("id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    const apiError: ApiError = { detail: `Failed to update profile: ${error.message}` };
    return NextResponse.json(apiError, { status: 500 });
  }

  return NextResponse.json(data);
}