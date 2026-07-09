"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  AlphabetDateRow,
  dateOptions,
  DateStatus,
  PhotoRow,
} from "@/types/alphabet";
import { useState } from "react";
import Polaroid from "./Polaroid";
import AddPhotoDialog from "./AddPhotoDialog";
import { DatePickerInput } from "../ui/datepicker";

const MAX_PHOTOS = 5;

function IlluminatedLetter({ letter }: { letter: string }) {
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center md:h-40 md:w-40">
      <div
        aria-hidden
        className="absolute inset-0 rounded-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.06 265) 0%, oklch(0.35 0.11 20) 100%)",
          boxShadow:
            "0 6px 16px oklch(0 0 0 / 0.2), inset 0 0 0 2px var(--color-gold), inset 0 0 0 4px oklch(0.28 0.06 265)",
        }}
      />
      <span className="relative font-display text-6xl italic text-gold md:text-8xl">
        {letter}
      </span>
    </div>
  );
}

function StampLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-sm border-2 border-burgundy/70 px-3 py-1 font-display text-sm uppercase tracking-[0.2em] text-burgundy"
      style={{
        transform: "rotate(-2deg)",
        background: "oklch(0.9 0.05 30 / 0.35)",
      }}
    >
      {children}
    </span>
  );
}

function ChapterPage({
  chapterData,
  photos,
}: {
  chapterData: AlphabetDateRow;
  photos: PhotoRow[];
}) {
  const [chapter, setChapter] = useState<
    AlphabetDateRow & { photos: PhotoRow[] }
  >({ ...chapterData, photos });
  const [isEditing, setIsEditing] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const idx = chapter.letter.charCodeAt(0) - 65;
  const prev = idx > 0 ? String.fromCharCode(64 + idx).toLowerCase() : null;
  const next = idx < 25 ? String.fromCharCode(66 + idx).toLowerCase() : null;

  const isEmpty = chapter.title === null;

  const addPhoto = (p: PhotoRow) => {
    setChapter((c) => ({
      ...c,
      photos: [...c.photos, p].slice(0, MAX_PHOTOS),
    }));
  };
  const removePhoto = (i: number) => {
    setChapter((c) => ({ ...c, photos: c.photos.filter((_, j) => j !== i) }));
  };
  const updatePhotoCaption = (i: number, caption: string) => {
    setChapter((c) => ({
      ...c,
      photos: c.photos.map((p, j) => (j === i ? { ...p, caption } : p)),
    }));
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
        {/* Top nav */}
        <div className="flex items-center justify-between font-hand text-lg text-burgundy">
          <Link href="/dates" className="hover:text-burgundy-deep">
            ← table of contents
          </Link>
          <span className="text-navy/60">chapter {idx + 1} of 26</span>
        </div>

        {/* Illuminated letter + title */}
        <header className="mt-6 grid grid-cols-[auto_1fr] items-start gap-6 md:gap-10">
          <IlluminatedLetter letter={chapter.letter} />
          <div className="pt-2 md:pt-6">
            <p className="font-hand text-2xl text-burgundy">
              {chapter.letter} is for…
            </p>
            {isEditing ? (
              <Input
                value={chapter.title ?? ""}
                onChange={(e) =>
                  setChapter((c) => ({ ...c, title: e.target.value }))
                }
                placeholder="a date title…"
                className="mt-1 h-auto border-0 border-b-2 border-navy/30 bg-transparent px-0 py-1 font-display text-4xl italic text-navy shadow-none focus-visible:border-burgundy focus-visible:ring-0 md:text-5xl"
              />
            ) : (
              <h1 className="mt-1 font-display text-5xl italic text-navy md:text-6xl">
                {isEmpty ? (
                  <span className="text-muted-foreground">
                    a date not yet written
                  </span>
                ) : (
                  chapter.title
                )}
              </h1>
            )}

            {/* Meta strip — editable when isEditing */}
            {isEditing ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="font-hand text-sm text-burgundy">
                    status
                  </Label>
                  <select
                    value={chapter.status ?? ""}
                    onChange={(e) =>
                      setChapter((c) => ({
                        ...c,
                        status: (e.target.value || null) as DateStatus | null,
                      }))
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-navy/25 bg-cream-deep px-2 py-1.5 font-body text-sm text-navy"
                  >
                    <option value="">—</option>
                    <option value="planned">planned</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
                <div>
                  <DatePickerInput
                    label="date"
                    formValue={new Date(chapter.scheduled_at || new Date())}
                    placeholder="e.g. Feb 14, 2027"
                    handleDateChange={(date) =>
                      setChapter((c) => ({
                        ...c,
                        scheduled_at: date.toISOString(),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="font-hand text-sm text-burgundy">
                    location
                  </Label>
                  <Input
                    value={chapter.location ?? ""}
                    onChange={(e) =>
                      setChapter((c) => ({
                        ...c,
                        location: e.target.value || null,
                      }))
                    }
                    placeholder="somewhere lovely"
                    className="mt-1 h-9 border-navy/25 bg-cream-deep text-sm"
                  />
                </div>
              </div>
            ) : (
              !isEmpty && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {chapter.status && (
                    <StampLabel>
                      {chapter.status === "completed" ? "completed" : "planned"}
                    </StampLabel>
                  )}
                  {chapter.scheduled_at && (
                    <span className="font-hand text-lg text-navy">
                      📅{" "}
                      {new Date(chapter.scheduled_at).toLocaleDateString(
                        undefined,
                        dateOptions,
                      )}
                    </span>
                  )}
                  {chapter.location && (
                    <span className="font-hand text-lg text-navy">
                      📍 {chapter.location}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </header>

        {/* Action bar */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPhotoModalOpen(true)}
            disabled={chapter.photos.length >= MAX_PHOTOS}
            className="rounded-sm border-navy/25 bg-cream-deep font-hand text-lg text-navy hover:bg-cream"
          >
            + add photo{" "}
            <span className="ml-1 text-sm text-muted-foreground">
              ({chapter.photos.length}/{MAX_PHOTOS})
            </span>
          </Button>
          <Button
            onClick={() => setIsEditing((v) => !v)}
            className="rounded-sm bg-navy font-hand text-lg text-cream hover:bg-navy-deep"
          >
            {isEditing ? "done editing" : "edit details"}
          </Button>
        </div>

        {/* Journal section — first */}
        <section className="paper deckle mt-6 rounded-sm p-8 md:p-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-navy">
              from the journal
            </h2>
            <span className="font-hand text-lg text-burgundy">§ note</span>
          </div>

          {isEditing ? (
            <Textarea
              value={chapter.note ?? ""}
              onChange={(e) =>
                setChapter((c) => ({ ...c, note: e.target.value || null }))
              }
              placeholder="what happened, what you'll remember, the small things…"
              className="mt-5 min-h-[180px] resize-y border-navy/25 bg-cream-deep/40 font-hand text-2xl leading-snug text-ink focus-visible:ring-burgundy"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent 0 32px, oklch(0.55 0.05 260 / 0.18) 32px 33px)",
              }}
            />
          ) : chapter.note ? (
            <p
              className="mt-5 font-hand text-2xl leading-snug text-ink"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent 0 32px, oklch(0.55 0.05 260 / 0.18) 32px 33px)",
                paddingBottom: 4,
              }}
            >
              {chapter.note}
            </p>
          ) : (
            <p className="mt-5 font-hand text-2xl italic text-muted-foreground">
              a blank page, waiting to be written on…
            </p>
          )}
        </section>

        {/* Polaroids section — second */}
        <section className="paper deckle mt-8 rounded-sm p-8 md:p-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-navy">the photographs</h2>
            <span className="font-hand text-lg text-burgundy">
              {chapter.photos.length}/{MAX_PHOTOS} taped in
            </span>
          </div>

          {chapter.photos.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center py-10 text-center">
              <p className="font-hand text-2xl text-muted-foreground">
                no photos taped in yet
              </p>
              <Button
                onClick={() => setPhotoModalOpen(true)}
                className="mt-4 rounded-sm bg-burgundy font-display tracking-wide text-cream hover:bg-burgundy-deep"
              >
                Tape in the first photo
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-start justify-center gap-x-6 gap-y-10">
              {chapter.photos.map((p, i) => (
                <Polaroid
                  key={i}
                  image={p}
                  editing={isEditing}
                  onCaption={(c) => updatePhotoCaption(i, c)}
                  onRemove={() => removePhoto(i)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Prev/next */}
        <nav className="mt-10 flex items-center justify-between font-hand text-lg">
          {prev ? (
            <Link
              href={`/chapter/${prev}`}
              className="text-navy hover:text-burgundy"
            >
              ← {prev.toUpperCase()}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/dashboard"
            className="text-burgundy hover:text-burgundy-deep"
          >
            all chapters
          </Link>
          {next ? (
            <Link
              href={`/chapter/${next}`}
              className="text-navy hover:text-burgundy"
            >
              {next.toUpperCase()} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      <AddPhotoDialog
        dateId={chapter.id}
        open={photoModalOpen}
        onOpenChange={setPhotoModalOpen}
        remaining={MAX_PHOTOS - chapter.photos.length}
      />
    </div>
  );
}

export default ChapterPage;
