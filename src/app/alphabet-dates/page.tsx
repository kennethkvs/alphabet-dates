import React from "react";
import DateCard from "@/components/alphabet/DateCard";

async function fetchDates() {
  const res = await fetch("/api/alphabet");
  if (!res.ok) return [];
  return res.json();
}

export default async function Page() {
  const dates = await fetchDates();
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Alphabet Dates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dates && dates.map((d: any) => <DateCard key={d.id} date={d} />)}
      </div>
    </main>
  );
}
