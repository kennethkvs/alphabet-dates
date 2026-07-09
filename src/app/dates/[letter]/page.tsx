import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { AlphabetDateRow, PhotoRow } from "@/types/alphabet";
import ChapterPage from "@/components/dates/ChapterPage";

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
  const dateImagesWithUrls = await Promise.all(
    dateImages?.map(async (image) => {
      const signedImageUrl = await server.storage
        .from("alphabet-dates")
        .createSignedUrl(image.medium_path, 3600);
      return {
        ...image,
        image_url: signedImageUrl.data?.signedUrl || "",
      };
    }) || [],
  );

  if (!dateData)
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="text-center">
          <h1 className="font-display text-4xl text-navy">
            That letter isn't in our alphabet
          </h1>
          <p className="mt-2 font-hand text-2xl text-burgundy">
            try A through Z
          </p>
          <Link
            href="/dates"
            className="mt-6 inline-block rounded-sm bg-navy px-5 py-2.5 text-cream hover:bg-navy-deep"
          >
            Back to table of contents
          </Link>
        </div>
      </div>
    );

  return <ChapterPage chapterData={dateData} photos={dateImagesWithUrls} />;
}
