"use client";
import React, { useState } from "react";

export default function InviteRequest() {
  const [email, setEmail] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, invitedByEmail: invitedBy || undefined }),
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
      <h2 className="text-xl font-semibold mb-3">Request an invite</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Invited by (email, optional)"
          value={invitedBy}
          onChange={(e) => setInvitedBy(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Creating…" : "Create invite"}
        </button>
      </form>
      {result && (
        <div className="mt-3 p-2 bg-gray-50 border rounded text-sm">
          <div>
            Invite created. Share this acceptance link with the invitee:
          </div>
          <pre className="break-words mt-2">
            {result.url || JSON.stringify(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
