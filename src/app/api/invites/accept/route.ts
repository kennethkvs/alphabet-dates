import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const server = createServerClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.used)
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 400 },
      );
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });

    // create auth user via Supabase admin
    const { data: userData, error: createErr } =
      await server.auth.admin.createUser({
        email: invite.email,
        password,
        email_confirm: true,
      } as any);
    if (createErr)
      return NextResponse.json({ error: createErr.message }, { status: 500 });

    const authUser = (userData as any)?.user || (userData as any);

    // insert into local users table
    await server
      .from("users")
      .insert({
        id: authUser.id,
        email: authUser.email,
        invited_by: invite.invited_by,
      })
      .select();

    // mark invite used and store auth_user_id
    await server
      .from("invites")
      .update({ used: true, auth_user_id: authUser.id })
      .eq("id", invite.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 },
    );
  }
}
