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
    <form onSubmit={signIn} className="mt-8 space-y-5">
      <label className="block">
        <span className="font-hand text-lg text-burgundy">your email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-0 border-b-2 border-navy/30 bg-transparent px-1 py-2 font-body text-lg text-navy placeholder:text-ink/30 focus:border-burgundy focus:outline-none focus:ring-0"
          placeholder="you@ouralphabet.love"
        />
      </label>

      <label className="block">
        <span className="font-hand text-lg text-burgundy">password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border-0 border-b-2 border-navy/30 bg-transparent px-1 py-2 font-body text-lg text-navy placeholder:text-ink/30 focus:border-burgundy focus:outline-none focus:ring-0"
          placeholder="our secret"
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 pt-2">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          <span className="font-hand text-base text-navy">{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 w-full rounded-sm bg-burgundy px-6 py-3 font-display text-base tracking-wide text-cream shadow-md transition-colors hover:bg-burgundy-deep"
      >
        {loading ? "Opening..." : "Open the scrapbook →"}
      </button>
    </form>
  );
}
