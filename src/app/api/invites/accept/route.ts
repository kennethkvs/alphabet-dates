import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { InviteRow } from "@/types/alphabet";

const server = createServerClient();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };
    const { token, password } = body;
    if (!token || !password)
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 },
      );

    const { data: invite, error: invErr } = await server
      .from("invites")
      .select("*")
      .eq("token", token)
      .limit(1)
      .maybeSingle();
    if (invErr)
      return NextResponse.json({ error: invErr.message }, { status: 500 });
    const inviteRow = invite as InviteRow | null;

    if (!inviteRow)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (inviteRow.used)
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 400 },
      );
    if (inviteRow.expires_at && new Date(inviteRow.expires_at) < new Date())
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    // create auth user via Supabase admin
    const { data: userData, error: createErr } =
      await server.auth.admin.createUser({
        email: inviteRow.email,
        password,
        email_confirm: true,
      });
    if (createErr)
      return NextResponse.json({ error: createErr.message }, { status: 500 });

    const authUser = userData.user;
    if (!authUser) {
      return NextResponse.json(
        { error: "Could not create user" },
        { status: 500 },
      );
    }

    // insert into local users table
    await server
      .from("users")
      .insert({
        id: authUser.id,
        email: authUser.email,
        invited_by: inviteRow.invited_by,
      })
      .select();

    // mark invite used and store auth_user_id
    await server
      .from("invites")
      .update({ used: true, auth_user_id: authUser.id })
      .eq("id", inviteRow.id);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
