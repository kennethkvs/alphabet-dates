import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import sharp from "sharp";

const server = createServerClient();
const BUCKET = "alphabet-dates";
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const dateId = form.get("dateId") as string | null;
    if (!dateId)
      return NextResponse.json({ error: "Missing dateId" }, { status: 400 });

    const files: File[] = [];
    for (const entry of form.values()) {
      // collect File objects
      if (entry instanceof File) files.push(entry);
    }

    if (files.length === 0)
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    if (files.length > MAX_FILES)
      return NextResponse.json(
        { error: `Max ${MAX_FILES} files allowed` },
        { status: 400 },
      );

    const results: any[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type))
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 },
        );
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > MAX_BYTES)
        return NextResponse.json({ error: "File too large" }, { status: 400 });

      const filenameBase = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
      // create variants
      const thumb = await sharp(buffer)
        .resize({ width: 150, withoutEnlargement: true })
        .toBuffer();
      const medium = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

      const pathThumb = `${dateId}/${filenameBase}-thumb.jpg`;
      const pathMedium = `${dateId}/${filenameBase}-medium.jpg`;
      const pathOriginal = `${dateId}/${filenameBase}-original${getExt(file.type)}`;

      // upload buffers to Supabase Storage
      await server.storage
        .from(BUCKET)
        .upload(pathThumb, thumb, { contentType: "image/jpeg", upsert: true });
      await server.storage
        .from(BUCKET)
        .upload(pathMedium, medium, {
          contentType: "image/jpeg",
          upsert: true,
        });
      await server.storage
        .from(BUCKET)
        .upload(pathOriginal, buffer, { contentType: file.type, upsert: true });

      // insert metadata into 'photos' table
      const meta = {
        date_id: dateId,
        filename: filenameBase,
        thumb_path: pathThumb,
        medium_path: pathMedium,
        original_path: pathOriginal,
        caption: (form.get("caption") as string) || null,
      };
      const { data, error } = await server
        .from("photos")
        .insert(meta)
        .select()
        .single();
      if (error) throw error;

      // generate signed urls
      const expiresIn = 60 * 60; // 1 hour
      const { data: thumbUrl } = await server.storage
        .from(BUCKET)
        .createSignedUrl(pathThumb, expiresIn);
      const { data: mediumUrl } = await server.storage
        .from(BUCKET)
        .createSignedUrl(pathMedium, expiresIn);
      const { data: originalUrl } = await server.storage
        .from(BUCKET)
        .createSignedUrl(pathOriginal, expiresIn);

      results.push({
        photo: data,
        urls: {
          thumb: thumbUrl?.signedUrl,
          medium: mediumUrl?.signedUrl,
          original: originalUrl?.signedUrl,
        },
      });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 },
    );
  }
}

function getExt(mime: string) {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}
