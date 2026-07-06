import React from "react";
import { createServerClient } from "@/lib/supabase";
import DateCard from "@/components/alphabet/DateCard";
import type { AlphabetDateRow } from "@/types/alphabet";

export default async function Page() {
  const server = createServerClient();
  const { data: dates } = await server
    .from("alphabet_dates")
    .select("*")
    .order("letter", { ascending: true });
  const alphabetDates = (dates ?? []) as AlphabetDateRow[];

  return (
    <main className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Alphabet Dates</h1>
        <a href="/invite" className="px-4 py-2 rounded border border-black">
          Invite
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {alphabetDates.map((date) => (
          <DateCard key={date.id} date={date} />
        ))}
      </div>
    </main>
  );
}
