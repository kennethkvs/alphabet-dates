"use client";
import React, { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Props = {
  nextPath?: string;
};

export default function LoginForm({ nextPath = "/dates" }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        setError(res.error.message);
      } else {
        router.push(nextPath);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={signIn} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="block w-full border px-3 py-2 rounded"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="block w-full border px-3 py-2 rounded"
      />
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a href="/invite" className="text-sm text-gray-600">
          Invite
        </a>
      </div>
    </form>
  );
}
