"use client";
import React, { useState } from "react";

type Props = { token: string };

export default function AcceptInvite({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-semibold mb-3">Accept Invite</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      {result && <div className="mt-3 text-sm">{JSON.stringify(result)}</div>}
    </div>
  );
}
