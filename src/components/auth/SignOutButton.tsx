"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignOutButton({
  className = "font-hand text-lg text-burgundy hover:text-burgundy-deep disabled:opacity-50",
}: {
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createSupabaseBrowserClient().auth.signOut();
    // A full document load, not router.push: it guarantees middleware
    // re-runs against the now-cookieless request instead of serving a
    // cached RSC tree.
    window.location.assign("/login");
  }

  return (
    <button type="button" onClick={signOut} disabled={busy} className={className}>
      {busy ? "closing the book…" : "sign out"}
    </button>
  );
}
