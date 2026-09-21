import Link from "next/link";
import InsideCover from "@/components/auth/InsideCover";
import LoginForm from "@/components/auth/LoginForm";

/**
 * The whole login screen as a two-page spread: inside cover on the left, the
 * sign-in form on the right (single page below `md`).
 *
 * Kept as one component so the landing page can render a scaled-down copy of
 * it inside the opened book and zoom into it. That copy must be pixel-identical
 * to /login for the hand-off to be invisible, so any change here shows up in
 * both places by construction.
 */
export default function LoginSpread({ nextPath }: { nextPath: string }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2">
        {/* Left "page" — inside cover */}
        <InsideCover className="hidden md:flex" />

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
          </div>
        </div>
      </div>
    </div>
  );
}
