import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import crypto from "crypto";
import type { InviteRow } from "@/types/alphabet";

const server = createServerClient();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      invitedByEmail?: string;
    };
    const { email, invitedByEmail } = body;
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // find inviter id if provided
    let invited_by: string | null = null;
    if (invitedByEmail) {
      const { data: inviter } = await server
        .from("users")
        .select("id")
        .eq("email", invitedByEmail)
        .limit(1)
        .maybeSingle();
      const inviterRecord = inviter as { id: string } | null;
      invited_by = inviterRecord?.id || null;
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expires_at = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7,
    ).toISOString(); // 7 days

    const { data, error } = await server
      .from("invites")
      .insert({ token, email, invited_by, expires_at })
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const invite = data as InviteRow;

    const site = process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = site
      ? `${site.replace(/\/$/, "")}/invite/accept/${token}`
      : `/invite/accept/${token}`;

    return NextResponse.json({ invite, url }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const { data, error } = await server
    .from("invites")
    .select("*")
    .eq("token", token)
    .limit(1)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  return NextResponse.json({ invite: data });
}
