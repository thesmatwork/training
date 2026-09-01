import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";
import type { ApiError, Task } from "@/lib/types";

// GET /api/tasks
export async function GET(request: NextRequest) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { token } = authResult;

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase.from("tasks").select("*");

  if (error) {
    const apiError: ApiError = { detail: `Failed to fetch tasks: ${error.message}` };
    return NextResponse.json(apiError, { status: 500 });
  }

  return NextResponse.json(data as Task[]);
}

// POST /api/tasks
// Body: { title: string, description?: string, status?: string }
export async function POST(request: NextRequest) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user, token } = authResult;

  const body = await request.json().catch(() => null);
  const title: string | undefined = body?.title;
  const description: string | undefined = body?.description;
  const status: string = body?.status || "pending";

  if (!title || !title.trim()) {
    const error: ApiError = { detail: "title is required" };
    return NextResponse.json(error, { status: 422 });
  }

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: title.trim(),
      description: description ?? null,
      status,
      user_id: user.id,
    })
    .select()
    .maybeSingle();

  if (error) {
    const apiError: ApiError = { detail: `Failed to create task: ${error.message}` };
    return NextResponse.json(apiError, { status: 500 });
  }

  return NextResponse.json(data as Task);
}