"use client";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";
import ChapterList from "@/components/dates/ChapterList";
import type { AlphabetDateRow, Filter } from "@/types/alphabet";
import Link from "next/link";

export default function Page() {
  const [alphabetDates, setAlphabetDates] = useState<AlphabetDateRow[] | null>(
    null
  );

  useEffect(() => {
    const fetchDates = async () => {
      const res = await supabase
        .from("alphabet_dates")
        .select("*")
        .order("letter", { ascending: true });
      setAlphabetDates(res.data as AlphabetDateRow[]);
    };
    fetchDates();
  }, []);

  const [filter, setFilter] = useState<Filter>("all");
  const stats = useMemo(() => {
    const completed = alphabetDates?.filter(
      (c) => c.status === "completed"
    ).length;
    const planned = alphabetDates?.filter((c) => c.status === "planned").length;
    return { completed, planned, total: 26 };
  }, [alphabetDates]);

  const rows = useMemo(() => {
    if (filter === "all") return alphabetDates;
    if (filter === "empty") return alphabetDates?.filter((c) => !c.status);
    return alphabetDates?.filter((c) => c.status === filter);
  }, [filter, alphabetDates]);

  const progress = Math.round(((stats.completed ?? 0) / stats.total) * 100);

  const mid = Math.ceil((rows?.length ?? 0) / 2);
  const leftCol = rows?.slice(0, mid) ?? [];
  const rightCol = rows?.slice(mid) ?? [];

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/"
              className="font-hand text-lg text-burgundy hover:text-burgundy-deep"
            >
              ← the cover
            </Link>
            <h1 className="mt-3 font-display text-5xl italic text-navy md:text-6xl">
              Table of Contents
            </h1>
            <p className="mt-2 font-hand text-2xl text-burgundy">
              twenty-six chapters, one for every letter
            </p>
          </div>

          {/* Progress ribbon */}
          <div className="min-w-[240px]">
            <div className="flex items-baseline justify-between font-hand text-navy">
              <span className="text-xl">
                {stats.completed}{" "}
                <span className="text-muted-foreground">/ 26 letters</span>
              </span>
              <span className="text-xl text-burgundy">{progress}%</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-navy/20 bg-cream-deep">
              <div
                className="h-full bg-gradient-to-r from-burgundy to-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {stats.completed} completed · {stats.planned} planned
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["all", "all chapters"],
              ["completed", "completed"],
              ["planned", "planned"],
              ["empty", "blank pages"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                "rounded-full border px-4 py-1.5 font-hand text-lg transition-colors " +
                (filter === key
                  ? "border-burgundy bg-burgundy text-cream"
                  : "border-navy/25 bg-transparent text-navy hover:bg-navy/5")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Two-column parchment TOC */}
        <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-2 md:grid-cols-2">
          <ChapterList entries={leftCol} />
          <ChapterList entries={rightCol} />
        </div>

        {rows?.length === 0 && (
          <p className="mt-12 text-center font-hand text-2xl text-muted-foreground">
            nothing here yet — try another filter
          </p>
        )}
      </div>
    </div>
  );
}
