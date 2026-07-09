import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import UploadPhotos from "@/components/alphabet/UploadPhotos";
import { AlphabetDateRow, PhotoRow } from "@/types/alphabet";
import DateImages from "@/components/dates/DateImages";

export default async function DatePage({
  params,
}: {
  params: Promise<{ letter: string }>;
}) {
  const server = createServerClient();
  const { letter } = await params;
  const { data: dateData }: { data: AlphabetDateRow | null } = await server
    .from("alphabet_dates")
    .select("*")
    .eq("letter", letter)
    .maybeSingle();
  const { data: dateImages }: { data: PhotoRow[] | null } = await server
    .from("photos")
    .select("*")
    .eq("date_id", dateData?.id);

  if (!dateData) return <div className="p-6">Date not found.</div>;
  return (
    <main className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">
          {dateData.letter} — {dateData.title}
        </h1>
        <Link href="/dates" className="px-4 py-2 rounded border border-black">
          Back
        </Link>
      </div>
      <h2 className="text-lg font-semibold mb-2">
        {dateData.description} -{" "}
        {dateData.scheduled_at
          ? `Scheduled: ${new Date(dateData.scheduled_at).toLocaleDateString()}`
          : "Not scheduled"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {dateImages?.map((image) => (
          <DateImages key={image.id} image={image} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/dates/${dateData.id}/edit`}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Edit
        </Link>
      </div>
      <section className="mt-6">
        <UploadPhotos dateId={dateData.id} />
      </section>
    </main>
  );
}
