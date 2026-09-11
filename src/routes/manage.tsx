import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { ArrowLeft, GripVertical, Heart, Plus, Trash2, UploadCloud } from "lucide-react";
import { Gate } from "@/components/Gate";
import { usePhotos } from "@/hooks/usePhotos";
import { CHAPTERS, type Chapter } from "@/lib/photos";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manage memories — For Purnima" },
      { name: "description", content: "Add, caption and arrange the photos in the album." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Manage memories — For Purnima" },
      { property: "og:description", content: "Add, caption and arrange the photos in the album." },
    ],
  }),
  component: () => (
    <Gate>
      <Manage />
    </Gate>
  ),
});

function Manage() {
  const {
    photos,
    loading,
    uploading,
    getImageUrl,
    updatePhoto,
    addPhotos,
    removePhoto,
    reorder,
  } = usePhotos();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    try {
      await addPhotos(list);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDropRow(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const from = photos.findIndex((p) => p._id === dragId);
    const to = photos.findIndex((p) => p._id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    void reorder(next);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/70 transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to the album
          </Link>
          <span className="font-hand text-2xl text-primary">adding memories</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-4xl text-foreground md:text-5xl">
          The memory <span className="italic text-primary">workshop</span>
        </h1>
        <p className="mt-3 max-w-[52ch] text-pretty text-sm leading-relaxed text-muted-foreground">
          Add new photos, write their captions in your own words, and drag them
          into the order the story should be told.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/60 px-6 py-12 text-center transition hover:border-primary/50 hover:bg-accent/40 disabled:opacity-60"
        >
          <UploadCloud className="size-8 text-primary" />
          <span className="font-hand text-3xl text-foreground/80">
            {uploading ? "developing the film…" : "drop in some new memories"}
          </span>
          <span className="text-xs text-muted-foreground">
            Choose as many photos as you like — they're saved right away.
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">
            <Plus className="size-4" /> Choose photos
          </span>
        </button>

        <div className="mt-12 space-y-4">
          {loading ? (
            <p className="py-10 text-center font-hand text-2xl text-muted-foreground">
              gathering our memories…
            </p>
          ) : (
            photos.map((photo) => (
              <div
                key={photo._id}
                draggable
                onDragStart={() => setDragId(photo._id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropRow(e, photo._id)}
                onDragEnd={() => setDragId(null)}
                className={`flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm transition ${
                  dragId === photo._id ? "opacity-50" : ""
                }`}
              >
                <GripVertical
                  className="size-5 shrink-0 cursor-grab text-muted-foreground/50"
                  aria-hidden
                />
                <img
                  src={getImageUrl(photo._id)}
                  alt={photo.caption || "memory"}
                  className="size-16 shrink-0 rounded-sm object-cover"
                />
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_150px_150px]">
                  <input
                    value={photo.caption}
                    onChange={(e) =>
                      void updatePhoto({ ...photo, caption: e.target.value })
                    }
                    placeholder="write a caption…"
                    aria-label="Caption"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-hand text-xl text-foreground outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={photo.date}
                    onChange={(e) =>
                      void updatePhoto({ ...photo, date: e.target.value })
                    }
                    aria-label="Date"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <select
                    value={photo.chapter}
                    onChange={(e) =>
                      void updatePhoto({ ...photo, chapter: e.target.value as Chapter })
                    }
                    aria-label="Chapter"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {CHAPTERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => void updatePhoto({ ...photo, favorite: !photo.favorite })}
                  aria-label="Toggle favorite"
                  aria-pressed={photo.favorite}
                  className="shrink-0 rounded-full p-2 transition hover:scale-110"
                >
                  <Heart
                    className={`size-4 ${
                      photo.favorite ? "fill-primary text-primary" : "text-foreground/30"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove this memory? This can't be undone.")) {
                      void removePhoto(photo._id);
                    }
                  }}
                  aria-label="Delete photo"
                  className="shrink-0 rounded-full p-2 text-foreground/30 transition hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
