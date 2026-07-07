import { createServerClient } from "@/lib/supabase";
import { PhotoRow } from "@/types/alphabet";
import Image from "next/image";

async function DateImages({ image }: { image: PhotoRow }) {
  const server = createServerClient();
  const signedImageUrl = await server.storage
    .from("alphabet-dates")
    .createSignedUrl(image.medium_path, 3600);
  const imageUrl = signedImageUrl.data?.signedUrl || "";

  return (
    <div>
      <Image
        src={imageUrl}
        alt="Date Image"
        width={300}
        height={300}
        loading="eager"
      />
      <h1>{image.caption}</h1>
    </div>
  );
}

export default DateImages;
