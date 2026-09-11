export const CHAPTERS = [
  "Sweet Moments",
  "Everyday Us",
  "Adventures",
  "Milestones",
] as const;

export type Chapter = (typeof CHAPTERS)[number];

export interface PhotoRecord {
  _id: string;
  caption: string;
  date: string; // ISO yyyy-mm-dd or ""
  chapter: Chapter;
  favorite: boolean;
  order: number;
  createdAt?: string;
}

/** Downscale an image file to a web-friendly JPEG blob (max 1600px). */
export async function fileToBlob(file: File, maxSize = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85,
    );
  });
}

/** Deterministic small tilt per photo id, in degrees. */
export function tiltFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const t = (Math.abs(h) % 5) - 2; // -2..2
  return t === 0 ? -1 : t;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
