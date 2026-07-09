import Link from "next/link";
import StatusPill from "./StatusPill";
import { AlphabetDateRow } from "@/types/alphabet";

function ChapterList({ entries }: { entries: AlphabetDateRow[] }) {
  return (
    <ul className="divide-y divide-navy/10">
      {entries.map((c) => {
        const isEmpty = c.title === null;
        return (
          <li key={c.letter}>
            <Link
              href="/dates/[letter]"
              as={`/dates/${c.letter.toUpperCase()}`}
              className="group flex items-center gap-4 py-3 transition-colors hover:bg-navy/[0.03]"
            >
              <span className="w-10 shrink-0 font-display text-3xl italic text-gold group-hover:text-burgundy">
                {c.letter}
              </span>

              <span
                aria-hidden
                className="hidden flex-1 items-center sm:flex"
                style={{
                  minWidth: 0,
                }}
              >
                <span
                  className="inline-block truncate font-display text-lg text-navy"
                  style={{ maxWidth: "100%" }}
                >
                  {isEmpty ? (
                    <span className="italic text-muted-foreground">
                      — awaiting a date —
                    </span>
                  ) : (
                    c.title
                  )}
                </span>
                <span
                  className="mx-3 h-px flex-1"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, oklch(0.55 0.04 60 / 0.6) 1px, transparent 1.5px)",
                    backgroundSize: "6px 2px",
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "left center",
                  }}
                />
                {c.location && (
                  <span className="mr-3 font-body text-sm italic text-muted-foreground">
                    {c.location}
                  </span>
                )}
                <StatusPill status={c.status} />
              </span>

              {/* Mobile compact */}
              <span className="flex-1 sm:hidden">
                <span className="block font-display text-base text-navy">
                  {isEmpty ? (
                    <span className="italic text-muted-foreground">
                      — awaiting —
                    </span>
                  ) : (
                    c.title
                  )}
                </span>
                {c.location && (
                  <span className="block text-xs italic text-muted-foreground">
                    {c.location}
                  </span>
                )}
              </span>
              <span className="sm:hidden">
                <StatusPill status={c.status} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default ChapterList;
