import { PhotoRow } from "@/types/alphabet";
import Image from "next/image";

function Polaroid({
  image,
  editing,
  onCaption,
  onRemove,
}: {
  image: PhotoRow;
  editing: boolean;
  onCaption: (c: string) => void;
  onRemove: () => void;
}) {
  const rotation = Math.random() * 10 - 3; // random rotation between -5 and 5 degrees

  return (
    <figure
      className="relative w-[240px] bg-white p-3 pb-10 shadow-xl md:w-[260px]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span
        aria-hidden
        className="tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg]"
      />
      {editing && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="absolute -right-2 -top-2 z-10 h-7 w-7 rounded-full bg-burgundy text-cream shadow-md hover:bg-burgundy-deep"
        >
          ×
        </button>
      )}
      <Image
        src={image.image_url}
        alt="Date Image"
        width={300}
        height={300}
        loading="lazy"
      />
      {editing ? (
        <input
          value={image.caption ?? ""}
          onChange={(e) => onCaption(e.target.value)}
          className="mt-2 w-full border-0 border-b border-dashed border-navy/30 bg-transparent text-center font-hand text-lg text-ink focus:border-burgundy focus:outline-none"
        />
      ) : (
        <figcaption className="mt-2 text-center font-hand text-lg text-ink">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Polaroid;
