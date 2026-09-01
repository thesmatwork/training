import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";
import type { ApiError, Task } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { token } = authResult;

  const { id } = await params;
  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (error || !data) {
    const apiError: ApiError = { detail: `Task with id ${id} not found` };
    return NextResponse.json(apiError, { status: 404 });
  }

  return NextResponse.json(data as Task);
}

// PUT /api/tasks/[id]
// Body: any subset of { title, description, status }
export async function PUT(request: NextRequest, { params }: Params) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { token } = authResult;

  const { id } = await params;
  const supabase = getSupabaseForUser(token);

  const existing = await supabase.from("tasks").select("*").eq("id", Number(id)).maybeSingle();
  if (!existing.data) {
    const apiError: ApiError = { detail: `Task with id ${id} not found` };
    return NextResponse.json(apiError, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const updateData: Partial<Task> = {};
  if (body?.title !== undefined) {
    if (!body.title.trim()) {
      const error: ApiError = { detail: "title cannot be empty" };
      return NextResponse.json(error, { status: 422 });
    }
    updateData.title = body.title.trim();
  }
  if (body?.description !== undefined) updateData.description = body.description;
  if (body?.status !== undefined) updateData.status = body.status;

  if (Object.keys(updateData).length === 0) {
    const error: ApiError = { detail: "No fields provided to update" };
    return NextResponse.json(error, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    const apiError: ApiError = { detail: `Failed to update task: ${error.message}` };
    return NextResponse.json(apiError, { status: 500 });
  }

  return NextResponse.json(data as Task);
}

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const authResult = await getCurrentUser(request);
  if (authResult instanceof NextResponse) return authResult;
  const { token } = authResult;

  const { id } = await params;
  const supabase = getSupabaseForUser(token);

  const existing = await supabase.from("tasks").select("*").eq("id", Number(id)).maybeSingle();
  if (!existing.data) {
    const apiError: ApiError = { detail: `Task with id ${id} not found` };
    return NextResponse.json(apiError, { status: 404 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", Number(id));

  if (error) {
    const apiError: ApiError = { detail: `Failed to delete task: ${error.message}` };
    return NextResponse.json(apiError, { status: 500 });
  }

  return NextResponse.json({ message: `Task ${id} deleted successfully` });
}