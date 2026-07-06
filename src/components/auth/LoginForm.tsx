"use client";
import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        setError(res.error.message);
      } else {
        router.push("/alphabet-dates");
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={signIn} className="max-w-md p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Log in</h2>
      <label className="block mb-2">
        <span className="text-sm">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border px-3 py-2 rounded"
        />
      </label>
      <label className="block mb-3">
        <span className="text-sm">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border px-3 py-2 rounded"
        />
      </label>
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
          Need an invite?
        </a>
      </div>
    </form>
  );
}
