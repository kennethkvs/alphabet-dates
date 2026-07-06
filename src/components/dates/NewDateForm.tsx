"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type CreateDatePayload = {
  letter: string;
  title: string;
  description?: string;
  scheduled_at?: string;
};

export default function NewDateForm() {
  const router = useRouter();
  const [letter, setLetter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: CreateDatePayload = {
      letter: letter.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || undefined,
      scheduled_at: scheduledAt || undefined,
    };

    try {
      const response = await fetch("/api/alphabet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to create date");
        return;
      }

      router.push("/dates");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <input
        value={letter}
        onChange={(event) => setLetter(event.target.value)}
        placeholder="Letter"
        maxLength={1}
        required
        className="block w-full border px-3 py-2 rounded"
      />
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        required
        className="block w-full border px-3 py-2 rounded"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        rows={4}
        className="block w-full border px-3 py-2 rounded"
      />
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(event) => setScheduledAt(event.target.value)}
        className="block w-full border px-3 py-2 rounded"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded border border-black"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
