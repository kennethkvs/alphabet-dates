import React from "react";
import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import UploadPhotos from "@/components/alphabet/UploadPhotos";

export default async function DatePage({ params }: { params: { id: string } }) {
  const server = createServerClient();
  const { data: date } = await server
    .from("alphabet_dates")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!date) return <div className="p-6">Date not found.</div>;
  return (
    <main className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">
          {date.letter} — {date.title}
        </h1>
        <Link
          href="/dates"
          className="px-4 py-2 rounded border border-black"
        >
          Back
        </Link>
      </div>
      <section className="mt-6">
        <UploadPhotos dateId={date.id} />
      </section>
    </main>
  );
}
