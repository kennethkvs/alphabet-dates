import { cn } from "@/lib/utils";

/**
 * The inside of the front cover — the navy "ex libris" page.
 *
 * Rendered twice: as the left page of the login spread, and on the back of
 * the cover on the landing page so that, when the book opens flat, the cover
 * already looks like the page the login screen zooms into.
 */
export default function InsideCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex-col justify-between overflow-hidden bg-navy p-12 text-cream",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 20%, oklch(0.45 0.1 40 / 0.3) 0, transparent 50%), repeating-linear-gradient(45deg, oklch(1 0 0 / 0.02) 0 2px, transparent 2px 6px)",
        }}
      />
      {/* burgundy ribbon bookmark */}
      <div
        className="absolute right-16 top-0 h-72 w-10 bg-burgundy shadow-lg"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)",
        }}
      />
      <div className="relative">
        <p className="font-hand text-2xl text-gold">ex libris</p>
        <h2 className="mt-3 font-display text-5xl italic text-cream">
          Our
          <br /> Alphabet
        </h2>
      </div>
      <div className="relative">
        <p className="max-w-sm font-body italic leading-relaxed text-cream/75">
          &ldquo;This book belongs to us. Every chapter, every taped-in photo,
          every scribble in the margin — ours.&rdquo;
        </p>
        <p className="mt-4 font-hand text-xl text-gold">— the inscription</p>
      </div>
    </div>
  );
}
