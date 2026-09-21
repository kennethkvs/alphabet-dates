"use client";

import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import LoginSpread from "@/components/auth/LoginSpread";
import InsideCover from "@/components/auth/InsideCover";
import { INITIALS, INITIALS_HAND } from "@/lib/names";

/**
 * Opening sequence:
 *
 *   closed ─click─▶ opening ──▶ settling ──▶ zooming ──▶ /login
 *            cover rotates     overlay        overlay grows
 *            (OPEN_MS)         fades in       to the viewport
 *                              (SETTLE_MS)    (ZOOM_MS)
 *
 * The inside of the book shows a scaled-down live copy of the login page.
 * Once the cover has settled, a fixed overlay with an identical copy fades in
 * exactly over the open book, then scales up until it fills the viewport. At
 * that point it *is* the login page at 1:1, so the navigation is a seamless
 * cut rather than a jump.
 */
type Phase = "closed" | "opening" | "settling" | "zooming";

const OPEN_MS = 1500;
const SETTLE_MS = 250;
const ZOOM_MS = 1000;
const ZOOM_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
// Share of the overlay's animation spent holding still while it fades in.
const HOLD_PCT = (100 * SETTLE_MS) / (SETTLE_MS + ZOOM_MS);
// Frame of navy back cover around the inside page (`inset-[10px]` below)
const PAGE_INSET = 10;

type Geometry = {
  /** Viewport, measured without a scrollbar — what /login will lay out in. */
  vw: number;
  vh: number;
  /** Open the book as a two-page spread (matches login's `md:` two columns)? */
  spread: boolean;
  /** Width of one page (the closed book). */
  pageW: number;
  /** Rect of the open book in viewport coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Login copy: scale, and its top-left relative to the open book's top-left. */
  scale: number;
  ox: number;
  oy: number;
};

function measure(book: HTMLElement): Geometry {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const r = book.getBoundingClientRect();
  // A spread needs room for the cover to lie flat to the left of the spine.
  const spread = 2 * r.width + 24 <= vw;
  const w = spread ? 2 * r.width : r.width;
  const h = r.height;
  // Cover-fit: the login page fills the open book, cropping the excess.
  const scale = Math.max(w / vw, h / vh);
  return {
    vw,
    vh,
    spread,
    pageW: r.width,
    x: spread ? r.left - r.width : r.left,
    y: r.top,
    w,
    h,
    scale,
    ox: (w - vw * scale) / 2,
    oy: (h - vh * scale) / 2,
  };
}

/** A non-interactive, viewport-sized copy of the login page. */
function LoginReplica({
  geo,
  style,
}: {
  geo: Geometry;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      inert
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: geo.vw, height: geo.vh, ...style }}
    >
      <LoginSpread nextPath="/dates" />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("closed");
  const [geo, setGeo] = useState<Geometry | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  // So the cut to /login is instant once the zoom lands.
  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  // Keep the hidden in-book copy laid out for the current viewport so nothing
  // has to mount or reflow on click.
  useEffect(() => {
    const update = () => {
      if (bookRef.current) setGeo(measure(bookRef.current));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const timeouts = timers.current;
    return () => {
      timeouts.forEach(window.clearTimeout);
      document.documentElement.style.overflow = "";
    };
  }, []);

  function openBook() {
    if (phase !== "closed" || !bookRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/login");
      return;
    }

    // /login never scrolls, so drop our scrollbar now: the copy inside the
    // book must be laid out at the same width /login will get.
    document.documentElement.style.overflow = "hidden";
    setGeo(measure(bookRef.current));
    setPhase("opening");

    later(() => {
      // Re-measure now that the book has finished sliding into place.
      if (bookRef.current) setGeo(measure(bookRef.current));
      setPhase("settling");
    }, OPEN_MS + 100);
  }

  // Overlay mounts and fades in (CSS) → zoom → navigate.
  useEffect(() => {
    if (phase !== "settling") return;
    later(() => setPhase("zooming"), SETTLE_MS);
    later(() => router.push("/login"), SETTLE_MS + ZOOM_MS + 50);
  }, [phase, later, router]);

  const opening = phase !== "closed";
  const zooming = phase === "zooming";
  const spread = geo?.spread ?? false;

  // Where the login copy sits inside the book's inner page (local coords).
  const inBookTransform = geo
    ? `translate(${(spread ? -geo.pageW : 0) - PAGE_INSET + geo.ox}px, ${
        -PAGE_INSET + geo.oy
      }px) scale(${geo.scale})`
    : undefined;

  // Overlay copy: starts exactly over the open book, ends filling the viewport.
  // One keyframe animation (hold, then zoom — see `book-zoom` below) rather
  // than a transition kicked off later: an element that is animating from the
  // moment it mounts gets rasterised at its final scale, exactly like the copy
  // inside the 3D book, so the crossfade between the two is invisible.
  let overlayStyle: CSSProperties | undefined;
  if (geo && (phase === "settling" || phase === "zooming")) {
    const left = Math.max(0, -geo.ox / geo.scale);
    const top = Math.max(0, -geo.oy / geo.scale);
    const right = Math.max(0, geo.vw - left - geo.w / geo.scale);
    const bottom = Math.max(0, geo.vh - top - geo.h / geo.scale);
    overlayStyle = {
      "--zoom-from": `translate(${geo.x + geo.ox}px, ${geo.y + geo.oy}px) scale(${geo.scale})`,
      "--zoom-clip": `inset(${top}px ${right}px ${bottom}px ${left}px round ${
        12 / geo.scale
      }px)`,
      animation: `book-zoom ${SETTLE_MS + ZOOM_MS}ms linear both`,
    } as CSSProperties;
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
        className={
          "relative transition-opacity ease-out " +
          (zooming ? "opacity-0" : "opacity-100")
        }
        style={{
          perspective: "2200px",
          perspectiveOrigin: "50% 50%",
          transitionDuration: `${ZOOM_MS / 2}ms`,
        }}
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
          ref={bookRef}
          className="relative h-[560px] w-[380px] transition-transform duration-[1200ms] ease-out sm:h-[640px] sm:w-[440px] md:h-[720px] md:w-[500px]"
          style={{
            transformStyle: "preserve-3d",
            // A spread is centred on the spine; a single page keeps the old nudge.
            transform: !opening
              ? "translateX(0)"
              : spread
                ? "translateX(50%)"
                : "translateX(-6%)",
          }}
        >
          {/* Back cover (stays put) */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[6px_14px_14px_6px]"
            style={{
              // Depth order while the cover swings: back cover (-2px) behind
              // the inside page (-1px) behind the cover's hinge (+1px). Without
              // explicit depths the 3D sort paints the page over the cover's
              // spine edge mid-swing. ±2px at this perspective is <0.5px on
              // screen, so the copy inside still lines up with the overlay.
              transform: "translateZ(-2px)",
              background:
                "linear-gradient(135deg, oklch(0.24 0.055 265) 0%, oklch(0.19 0.05 265) 60%, oklch(0.16 0.045 265) 100%)",
              boxShadow:
                "inset 0 0 60px oklch(0 0 0 / 0.55), 0 30px 60px -20px oklch(0 0 0 / 0.7)",
            }}
          />

          {/* Inside page — the login screen, scaled to fit the open book */}
          <div
            aria-hidden
            className="absolute inset-[10px] overflow-hidden rounded-[3px_10px_10px_3px]"
            style={{
              // See the back cover's translateZ for why.
              transform: "translateZ(-1px)",
              background:
                "linear-gradient(90deg, oklch(0.86 0.04 82) 0%, oklch(0.94 0.028 85) 8%, oklch(0.94 0.028 85) 92%, oklch(0.86 0.04 82) 100%)",
              boxShadow:
                "inset 12px 0 24px -12px oklch(0.60 0.06 45 / 0.5), inset 0 0 40px oklch(0.70 0.06 45 / 0.15)",
            }}
          >
            {geo && (
              <LoginReplica geo={geo} style={{ transform: inBookTransform }} />
            )}
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
              // Flat (180°) for a spread so the cover's back becomes the left
              // page; leaned open otherwise so it clears the single page. The
              // 1px lift keeps the hinge in front of the page (see back cover).
              transform: !opening
                ? "translateZ(1px) rotateY(0deg)"
                : spread
                  ? "translateZ(1px) rotateY(-180deg)"
                  : "translateZ(1px) rotateY(-158deg)",
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
                    {INITIALS_HAND}
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
                    {INITIALS}
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

            {/* Back of the front cover — the inside cover page of the login
                spread, so the open book already reads as the login screen */}
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-[14px_6px_6px_14px]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                boxShadow: "inset 0 0 40px oklch(0 0 0 / 0.35)",
              }}
            >
              <InsideCover className="flex h-full" />
            </div>
          </div>
        </div>

        {/* CTA below the book */}
        <div
          className={
            "mt-10 flex flex-col items-center gap-3 transition-opacity duration-700 " +
            (opening ? "opacity-0" : "opacity-100")
          }
        >
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

      {/* Zoom overlay: a second copy of the login page, laid exactly over the
          open book, that grows to fill the viewport before we navigate */}
      {geo && overlayStyle && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ animation: `overlay-in ${SETTLE_MS}ms ease-out both` }}
        >
          <LoginReplica geo={geo} style={overlayStyle} />
        </div>
      )}

      <style>{`
        @keyframes overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* Hold over the open book while the overlay fades in, then zoom. */
        @keyframes book-zoom {
          0%, ${HOLD_PCT}% {
            transform: var(--zoom-from);
            clip-path: var(--zoom-clip);
            animation-timing-function: ${ZOOM_EASE};
          }
          100% {
            transform: translate(0px, 0px) scale(1);
            clip-path: inset(0px 0px 0px 0px round 0px);
          }
        }
        .book-cover-open {
          box-shadow: 0 30px 60px -15px oklch(0 0 0 / 0.5) !important;
        }
      `}</style>
    </div>
  );
}
