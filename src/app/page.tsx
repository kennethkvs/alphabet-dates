import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center">
      <main className="w-full max-w-4xl p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Alphabet Dates</h1>
            <nav>
              <Link
                href="/login"
                className="text-sm text-indigo-600 hover:underline mr-4"
              >
                Log in
              </Link>
              <Link
                href="/invite"
                className="text-sm text-gray-600 hover:underline"
              >
                Request invite
              </Link>
            </nav>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Create meaningful A→Z dates with your partner
              </h2>
              <p className="text-gray-600 mb-4">
                Plan, schedule, and capture memories for 26 themed dates — one
                per letter A through Z. Upload photos after each date and keep
                captions and private storage for your memories.
              </p>
              <Link
                href="/alphabet-dates"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded"
              >
                View dates
              </Link>
            </div>
            <div>
              <h3 className="font-medium mb-2">Why use this app?</h3>
              <ul className="list-disc ml-5 text-gray-700">
                <li>Organize and schedule A→Z date ideas.</li>
                <li>Upload photos with captions afterwards.</li>
                <li>
                  Private storage with signed URLs and invite-only access.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
