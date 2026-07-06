"use client";
import React, { useState } from "react";

type Props = { dateId: string };

export default function UploadPhotos({ dateId }: Props) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) return;
    const form = new FormData();
    form.append("dateId", dateId);
    for (const f of Array.from(files)) form.append("files", f);
    form.append("caption", caption || "");

    setLoading(true);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        {loading ? "Uploading…" : "Upload"}
      </button>
      {result ? (
        <pre className="mt-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </form>
  );
}
