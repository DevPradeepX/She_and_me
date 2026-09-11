import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X, ZoomIn, ZoomOut } from "lucide-react";
import { formatDate, type PhotoRecord } from "@/lib/photos";

interface Props {
  photos: PhotoRecord[];
  index: number;
  urlFor: (id: string) => string | undefined;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleFavorite: (id: string) => void;
}

export function Lightbox({
  photos,
  index,
  urlFor,
  onClose,
  onNavigate,
  onToggleFavorite,
}: Props) {
  const [zoomed, setZoomed] = useState(false);
  const photo = photos[index];
  const url = photo ? urlFor(photo._id) : undefined;

  const prev = useCallback(() => {
    setZoomed(false);
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onNavigate]);

  const next = useCallback(() => {
    setZoomed(false);
    onNavigate((index + 1) % photos.length);
  }, [index, photos.length, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  if (!photo || !url) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-background/15 p-2.5 text-background transition hover:bg-background/30"
      >
        <X className="size-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/15 p-3 text-background transition hover:bg-background/30 md:left-6"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/15 p-3 text-background transition hover:bg-background/30 md:right-6"
      >
        <ChevronRight className="size-6" />
      </button>

      <div
        className="flex max-h-full w-full max-w-4xl flex-col items-center gap-5 overflow-auto md:flex-row md:items-center md:gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative min-w-0 flex-1">
          <img
            src={url}
            alt={photo.caption || "A memory of Purnima"}
            onClick={() => setZoomed((z) => !z)}
            className={`mx-auto max-h-[70vh] rounded-sm object-contain shadow-2xl transition-transform duration-300 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className="absolute bottom-3 right-3 rounded-full bg-background/80 p-2 text-foreground shadow transition hover:bg-background"
          >
            {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>
        </div>

        <div className="w-full shrink-0 text-center md:w-56 md:text-left">
          <p className="font-hand text-4xl leading-tight text-background">
            {photo.caption || "untitled memory"}
          </p>
          {photo.date && (
            <p className="mt-2 text-sm text-background/70">{formatDate(photo.date)}</p>
          )}
          <span className="mt-3 inline-block rounded-full bg-background/15 px-3 py-1 text-xs font-medium tracking-wide text-background/85">
            {photo.chapter}
          </span>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onToggleFavorite(photo._id)}
              aria-pressed={photo.favorite}
              className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-sm text-background transition hover:bg-background/30"
            >
              <Heart
                className={`size-4 ${photo.favorite ? "fill-red-300 text-red-300" : ""}`}
              />
              {photo.favorite ? "A favorite" : "Mark as favorite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
