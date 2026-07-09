"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  function openBook() {
    if (opening) return;
    setOpening(true);
    // Match the CSS animation duration below
    window.setTimeout(() => {
      router.push("/login");
    }, 3000);
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-16">
      {/* ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, oklch(0.42 0.10 40 / 0.35) 0%, transparent 65%)",
        }}
      />
      {/* desk vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, oklch(0 0 0 / 0.6) 0%, transparent 55%)",
        }}
      />

      {/* Stage — 3D perspective */}
      <div
        className="relative"
        style={{ perspective: "2200px", perspectiveOrigin: "50% 50%" }}
      >
        {/* soft floor shadow beneath the book */}
        <div
          aria-hidden
          className={
            "absolute left-1/2 top-full h-10 w-[85%] -translate-x-1/2 -translate-y-4 rounded-[50%] bg-black/70 blur-2xl transition-all duration-[1500ms] " +
            (opening ? "scale-x-125 opacity-40" : "opacity-70")
          }
        />

        {/* Book */}
        <div
          className={
            "relative h-[560px] w-[380px] sm:h-[640px] sm:w-[440px] md:h-[720px] md:w-[500px] transition-transform duration-[1200ms] ease-out " +
            (opening ? "translate-x-[-6%]" : "")
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back cover (stays put) */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[6px_14px_14px_6px]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.24 0.055 265) 0%, oklch(0.19 0.05 265) 60%, oklch(0.16 0.045 265) 100%)",
              boxShadow:
                "inset 0 0 60px oklch(0 0 0 / 0.55), 0 30px 60px -20px oklch(0 0 0 / 0.7)",
            }}
          />

          {/* Inside pages — visible when cover opens */}
          <div
            aria-hidden
            className="absolute inset-[10px] overflow-hidden rounded-[3px_10px_10px_3px]"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.86 0.04 82) 0%, oklch(0.94 0.028 85) 8%, oklch(0.94 0.028 85) 92%, oklch(0.86 0.04 82) 100%)",
              boxShadow:
                "inset 12px 0 24px -12px oklch(0.60 0.06 45 / 0.5), inset 0 0 40px oklch(0.70 0.06 45 / 0.15)",
            }}
          >
            {/* page edges/lines */}
            <div
              className="absolute inset-y-3 left-3 w-[3px] rounded"
              style={{
                background:
                  "repeating-linear-gradient(180deg, oklch(0.80 0.04 80) 0 2px, oklch(0.70 0.06 60) 2px 3px)",
              }}
            />
            <div
              className="absolute inset-y-3 right-3 w-[3px] rounded"
              style={{
                background:
                  "repeating-linear-gradient(180deg, oklch(0.80 0.04 80) 0 2px, oklch(0.70 0.06 60) 2px 3px)",
              }}
            />
            {/* center gutter */}
            <div
              className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0 0 0 / 0.18) 45%, oklch(0 0 0 / 0.28) 50%, oklch(0 0 0 / 0.18) 55%, transparent)",
              }}
            />
            {/* faint handwritten preview */}
            <div className="absolute left-6 right-1/2 top-10 pr-6 font-hand text-navy/40">
              <p className="text-3xl leading-tight">to us,</p>
              <p className="mt-2 text-xl leading-snug">
                and every chapter we haven&apos;t written yet…
              </p>
            </div>
            <div className="absolute right-6 top-16 font-display italic text-burgundy/50">
              <p className="text-2xl">Chapter A</p>
              <div className="mt-2 h-px w-24 bg-burgundy/30" />
            </div>
          </div>

          {/* Front cover — this is what rotates open */}
          <div
            className={
              "absolute inset-0 origin-left rounded-[6px_14px_14px_6px] transition-transform duration-[1500ms] " +
              (opening ? "book-cover-open" : "")
            }
            style={{
              transformStyle: "preserve-3d",
              transitionTimingFunction: "cubic-bezier(0.6, 0.02, 0.32, 1)",
              background:
                "linear-gradient(135deg, oklch(0.30 0.065 265) 0%, oklch(0.24 0.06 265) 45%, oklch(0.18 0.05 265) 100%)",
              boxShadow:
                "inset 0 0 80px oklch(0 0 0 / 0.55), 0 30px 60px -15px oklch(0 0 0 / 0.7)",
            }}
          >
            {/* leather grain */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[6px_14px_14px_6px] opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, oklch(1 0 0 / 0.5), transparent 60%),\
                   radial-gradient(1px 1px at 70% 80%, oklch(1 0 0 / 0.35), transparent 60%),\
                   radial-gradient(1px 1px at 40% 60%, oklch(0 0 0 / 0.5), transparent 60%),\
                   repeating-linear-gradient(37deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 3px),\
                   repeating-linear-gradient(120deg, oklch(0 0 0 / 0.05) 0 1px, transparent 1px 4px)",
                backgroundSize:
                  "180px 180px, 220px 220px, 260px 260px, auto, auto",
              }}
            />

            {/* burgundy spine strip on the left edge */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-8 rounded-l-[6px]"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.28 0.12 20) 0%, oklch(0.36 0.13 20) 40%, oklch(0.28 0.12 20) 100%)",
                boxShadow:
                  "inset -6px 0 12px oklch(0 0 0 / 0.55), inset 2px 0 4px oklch(1 0 0 / 0.08)",
              }}
            />
            {/* spine gold bands */}
            <div className="absolute left-0 top-16 h-3 w-8 bg-gold/80 shadow-[inset_0_-2px_0_oklch(0_0_0/0.4)]" />
            <div className="absolute bottom-16 left-0 h-3 w-8 bg-gold/80 shadow-[inset_0_-2px_0_oklch(0_0_0/0.4)]" />
            {/* stitching along spine */}
            <div
              aria-hidden
              className="absolute inset-y-6 left-9 w-px"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, oklch(0.75 0.11 30) 0 6px, transparent 6px 12px)",
              }}
            />

            {/* gold ornamental border */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-6 rounded-[2px] border border-gold/70"
              style={{
                boxShadow:
                  "inset 0 0 0 6px transparent, inset 0 0 0 7px oklch(0.72 0.11 78 / 0.45)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-8 rounded-[2px] border border-gold/40"
            />

            {/* corner flourishes */}
            {[
              "top-6 left-6",
              "top-6 right-6 rotate-90",
              "bottom-6 right-6 rotate-180",
              "bottom-6 left-6 -rotate-90",
            ].map((pos) => (
              <svg
                key={pos}
                className={`pointer-events-none absolute h-10 w-10 text-gold/80 ${pos}`}
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              >
                <path d="M2 2 L2 14 M2 2 L14 2" />
                <path d="M6 6 C 10 6, 14 8, 14 14" />
                <path d="M6 6 C 6 10, 8 14, 14 14" />
                <circle cx="14" cy="14" r="1" fill="currentColor" />
              </svg>
            ))}

            {/* Title block */}
            <div className="relative flex h-full flex-col items-center justify-between px-10 py-16 text-center">
              <div>
                <p className="font-hand text-xl text-gold sm:text-2xl">
                  volume I
                </p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-gold/60" />
                  <span className="text-[10px] uppercase tracking-[0.4em] text-gold/80">
                    a scrapbook
                  </span>
                  <span className="h-px w-8 bg-gold/60" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h1
                  className="font-display text-5xl leading-[0.95] text-gold-soft sm:text-6xl md:text-7xl"
                  style={{
                    textShadow:
                      "0 1px 0 oklch(0.55 0.09 78), 0 2px 6px oklch(0 0 0 / 0.6)",
                    letterSpacing: "0.01em",
                  }}
                >
                  Our
                </h1>
                <h1
                  className="mt-1 font-display text-6xl italic leading-[0.95] text-gold sm:text-7xl md:text-8xl"
                  style={{
                    textShadow:
                      "0 1px 0 oklch(0.55 0.09 78), 0 2px 8px oklch(0 0 0 / 0.7)",
                  }}
                >
                  Alphabet
                </h1>
                <div className="mt-6 flex items-center gap-3">
                  <span className="h-px w-10 bg-gold/50" />
                  <span className="font-hand text-2xl text-gold-soft">
                    a &amp; b
                  </span>
                  <span className="h-px w-10 bg-gold/50" />
                </div>
              </div>

              {/* Gold wax seal */}
              <div className="relative">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, oklch(0.85 0.12 82) 0%, oklch(0.68 0.13 78) 45%, oklch(0.48 0.11 70) 100%)",
                    boxShadow:
                      "0 6px 14px oklch(0 0 0 / 0.55), inset 0 -3px 6px oklch(0 0 0 / 0.4), inset 0 3px 6px oklch(1 0 0 / 0.35)",
                    clipPath:
                      "polygon(50% 0%, 63% 6%, 78% 4%, 88% 15%, 96% 28%, 100% 45%, 96% 62%, 88% 76%, 78% 88%, 63% 96%, 50% 100%, 37% 96%, 22% 88%, 12% 76%, 4% 62%, 0% 45%, 4% 28%, 12% 15%, 22% 4%, 37% 6%)",
                  }}
                >
                  <span
                    className="font-display text-3xl italic text-navy-deep sm:text-4xl"
                    style={{ textShadow: "0 1px 0 oklch(0.85 0.12 82)" }}
                  >
                    A&amp;Z
                  </span>
                </div>
              </div>
            </div>

            {/* subtle highlight sweep on the cover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[6px_14px_14px_6px]"
              style={{
                background:
                  "linear-gradient(115deg, transparent 40%, oklch(1 0 0 / 0.06) 50%, transparent 60%)",
              }}
            />

            {/* Back of the front cover (visible while opening) */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[6px_14px_14px_6px]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                background:
                  "linear-gradient(135deg, oklch(0.90 0.03 85) 0%, oklch(0.86 0.04 82) 100%)",
                boxShadow: "inset 0 0 40px oklch(0.60 0.06 45 / 0.25)",
              }}
            >
              <div className="flex h-full items-center justify-center">
                <p className="font-hand text-2xl text-burgundy/70">
                  ex libris — a &amp; z
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below the book */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={openBook}
            disabled={opening}
            className="group inline-flex items-center gap-3 rounded-sm bg-burgundy px-8 py-3.5 font-display text-base tracking-wide text-cream shadow-lg shadow-black/40 transition-all hover:bg-burgundy-deep hover:shadow-xl disabled:opacity-70"
          >
            {opening ? "Opening…" : "Open the book"}
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          <p className="font-hand text-lg text-cream/50">est. the day we met</p>
        </div>
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-gold/50">
        handmade · one of a kind · ours
      </p>

      <style>{`
        .book-cover-open {
          transform: rotateY(-158deg);
          box-shadow: 0 30px 60px -15px oklch(0 0 0 / 0.5) !important;
        }
      `}</style>
    </div>
  );
}
