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

function AddPhotoDialog({
  dateId,
  open,
  onOpenChange,
  remaining,
}: {
  dateId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  remaining: number;
}) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCaption("");
    setFile(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || file.length === 0) return;
    const form = new FormData();
    form.append("dateId", dateId);
    for (const f of Array.from(file)) form.append("files", f);
    form.append("caption", caption || "");

    setLoading(true);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: form });

      if (res.ok) {
        reset();
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      reset();
      onOpenChange(false);
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
            disabled={!(file || remaining <= 0 || loading)}
            className="rounded-sm bg-burgundy text-cream hover:bg-burgundy-deep"
          >
            Tape it in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddPhotoDialog;
