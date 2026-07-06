import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-semibold text-center">Alphabet Dates</h1>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className="px-4 py-2 rounded bg-black text-white">
          Log in
        </Link>
        <Link href="/invite" className="px-4 py-2 rounded border border-black">
          Invite
        </Link>
        <Link href="/dates" className="px-4 py-2 rounded border border-black">
          Dates
        </Link>
      </div>
    </main>
  );
}
