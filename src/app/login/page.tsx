import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next || "/dates";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2">
        {/* Left "page" — inside cover */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-cream md:flex">
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
              "This book belongs to us. Every chapter, every taped-in photo,
              every scribble in the margin — ours."
            </p>
            <p className="mt-4 font-hand text-xl text-gold">
              — the inscription
            </p>
          </div>
        </div>

        {/* Right "page" — the form */}
        <div className="relative flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="font-hand text-lg text-burgundy hover:text-burgundy-deep"
            >
              ← back to the cover
            </Link>

            <h1 className="mt-8 font-display text-4xl text-navy">
              Sign in to your book
            </h1>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Only the two of you have the key.
            </p>

            <LoginForm nextPath={nextPath} />

            <p className="mt-8 text-center font-hand text-lg text-navy/70">
              new here?{" "}
              <span className="ink-underline cursor-pointer text-burgundy">
                start a fresh book
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
