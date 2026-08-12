"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import type { PhotoRow } from "@/types/alphabet";

function AddPhotoDialog({
  dateId,
  open,
  onOpenChange,
  remaining,
  onAdded,
}: {
  dateId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  remaining: number;
  onAdded: (photos: PhotoRow[]) => void;
}) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCaption("");
    setFile(null);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || file.length === 0) return;
    const form = new FormData();
    form.append("dateId", dateId);
    for (const f of Array.from(file)) form.append("files", f);
    form.append("caption", caption || "");

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          typeof body?.error === "string"
            ? body.error
            : "Upload failed. Try again.",
        );
        return; // keep the dialog open and the file selected so the failure is visible
      }

      // /api/uploads returns { results: [{ photo, urls: { medium } }] }.
      // photo.image_url is null in the DB — the signed URL lives in
      // urls.medium and must be merged in, since Polaroid renders
      // image_url directly.
      const added: PhotoRow[] = (body?.results ?? []).map(
        (r: { photo: PhotoRow; urls: { medium: string } }) => ({
          ...r.photo,
          image_url: r.urls.medium,
        }),
      );

      onAdded(added);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="bg-cream">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl italic text-navy">
            Tape in a new photo
          </DialogTitle>
          <DialogDescription className="font-hand text-lg text-burgundy">
            {remaining > 0
              ? `you can add ${remaining} more`
              : "the page is full"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="font-hand text-lg text-burgundy">
              upload from device
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files)}
              className="mt-1 border-navy/25 bg-cream-deep/60 font-body text-navy file:text-navy"
            />
          </div>

          <div>
            <Label className="font-hand text-lg text-burgundy">caption</Label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="a little handwritten note"
              className="mt-1 border-navy/25 bg-cream-deep/60 text-navy placeholder:text-navy/50"
            />
          </div>

          {error && (
            <p className="font-hand text-lg text-burgundy" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-sm border-navy/25"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || remaining <= 0 || !file || file.length === 0}
            className="rounded-sm bg-burgundy text-cream hover:bg-burgundy-deep"
          >
            {loading ? "taping in…" : "Tape it in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddPhotoDialog;
