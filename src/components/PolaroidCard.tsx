import { Heart } from "lucide-react";
import { tiltFor, type PhotoRecord } from "@/lib/photos";

interface Props {
  photo: PhotoRecord;
  url: string;
  onOpen: () => void;
  onToggleFavorite: () => void;
}

export function PolaroidCard({ photo, url, onOpen, onToggleFavorite }: Props) {
  const tilt = tiltFor(photo._id);

  return (
    <figure className="group relative mb-6 break-inside-avoid">
      <div
        className="rounded-sm bg-card p-3 pb-4 shadow-[0_2px_10px_rgba(58,46,36,0.12),0_12px_28px_rgba(58,46,36,0.10)] ring-1 ring-foreground/5 transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_6px_16px_rgba(58,46,36,0.16),0_20px_40px_rgba(58,46,36,0.14)]"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="block w-full cursor-pointer overflow-hidden bg-muted"
          aria-label={photo.caption ? `Open photo: ${photo.caption}` : "Open photo"}
        >
          <img
            src={url}
            alt={photo.caption || "A memory of Purnima"}
            loading="lazy"
            className="aspect-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
        <figcaption className="flex items-end justify-between gap-2 px-1 pt-3">
          <span className="font-hand text-2xl leading-tight text-foreground/85">
            {photo.caption || "untitled memory"}
          </span>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={photo.favorite ? "Remove from favorites" : "Mark as favorite"}
            aria-pressed={photo.favorite}
            className="shrink-0 rounded-full p-1.5 transition hover:scale-125"
          >
            <Heart
              className={`size-5 transition ${
                photo.favorite
                  ? "fill-primary text-primary"
                  : "text-foreground/30 hover:text-primary"
              }`}
            />
          </button>
        </figcaption>
      </div>
    </figure>
  );
}
