import React from "react";
import UploadPhotos from "@/components/alphabet/UploadPhotos";

async function fetchDate(id: string) {
  const res = await fetch(`/api/alphabet?id=${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  // API might return array; try to find by id
  if (Array.isArray(data)) return data.find((d: any) => d.id === id) || null;
  return data;
}

export default async function DatePage({ params }: { params: { id: string } }) {
  const date = await fetchDate(params.id);
  if (!date) return <div className="p-6">Date not found.</div>;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        {date.letter} — {date.title}
      </h1>
      <p className="mt-2 text-gray-600">{date.description}</p>
      <section className="mt-6">
        <h2 className="font-semibold">Upload photos</h2>
        <UploadPhotos dateId={date.id} />
      </section>
    </main>
  );
}
