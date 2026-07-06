import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const server = createServerClient();

export async function GET() {
  const { data, error } = await server
    .from("alphabet_dates")
    .select("*")
    .order("letter", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const toInsert = {
      letter: body.letter,
      title: body.title,
      description: body.description || null,
      scheduled_at: body.scheduled_at || null,
    };
    const { data, error } = await server
      .from("alphabet_dates")
      .insert(toInsert)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
