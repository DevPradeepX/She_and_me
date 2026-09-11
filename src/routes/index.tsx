import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Images } from "lucide-react";
import { Gate, lockAlbum } from "@/components/Gate";
import { PolaroidCard } from "@/components/PolaroidCard";
import { Lightbox } from "@/components/Lightbox";
import { usePhotos } from "@/hooks/usePhotos";
import { CHAPTERS } from "@/lib/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Purnima — Our Polaroid Album" },
      {
        name: "description",
        content:
          "A private Polaroid album of our favourite moments together, kept safe behind a secret.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "For Purnima — Our Polaroid Album" },
      {
        property: "og:description",
        content: "A private Polaroid album of our favourite moments together.",
      },
    ],
  }),
  component: () => (
    <Gate>
      <Album />
    </Gate>
  ),
});

const PAGE_SIZE = 24;
const PETALS = [
  { left: "7%", duration: "16s", delay: "0s" },
  { left: "23%", duration: "21s", delay: "-5s" },
  { left: "44%", duration: "18s", delay: "-9s" },
  { left: "61%", duration: "23s", delay: "-3s" },
  { left: "78%", duration: "17s", delay: "-12s" },
  { left: "92%", duration: "20s", delay: "-7s" },
];

function Album() {
  const { photos, loading, getImageUrl, favoriteCount, toggleFavorite } = usePhotos();
  const [filter, setFilter] = useState<string>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return photos;
    if (filter === "Favorites") return photos.filter((p) => p.favorite);
    return photos.filter((p) => p.chapter === filter);
  }, [photos, filter]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="petal-drift absolute top-0 font-display text-xl text-primary/35"
            style={
              {
                left: p.left,
                "--petal-duration": p.duration,
                "--petal-delay": p.delay,
              } as React.CSSProperties
            }
          >
            ❦
          </span>
        ))}
      </div>

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-hand text-2xl text-primary">Purnima &amp; me</span>
          <Link
            to="/manage"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground/75 transition hover:border-primary hover:text-primary"
          >
            <Images className="size-4" /> Add memories
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-14 pt-20 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          A love letter in Polaroids
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] text-balance text-foreground md:text-8xl">
          Every moment
          <br />
          <span className="italic text-primary">with you, Purnima</span>
        </h1>
        <p className="mx-auto mt-8 max-w-[42ch] text-pretty leading-relaxed text-muted-foreground">
          I kept every frame I never wanted to forget. Pick one up, turn it over,
          stay a while.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-border" />
          <span className="font-display text-xl text-primary">❦</span>
          <span className="h-px w-12 bg-border" />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Chip label="All" active={filter === "All"} onClick={() => setFilter("All")} />
          {CHAPTERS.map((c) => (
            <Chip
              key={c}
              label={c}
              active={filter === c}
              onClick={() => {
                setFilter(c);
                setVisible(PAGE_SIZE);
              }}
            />
          ))}
          <Chip
            label={`Favorites (${favoriteCount})`}
            active={filter === "Favorites"}
            icon
            onClick={() => {
              setFilter("Favorites");
              setVisible(PAGE_SIZE);
            }}
          />
        </div>

        {loading ? (
          <p className="py-20 text-center font-hand text-3xl text-muted-foreground">
            gathering our memories…
          </p>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-hand text-3xl text-muted-foreground">
              nothing here yet
            </p>
            <Link
              to="/manage"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Add the first photo
            </Link>
          </div>
        ) : (
          <>
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {shown.map((photo) => {
                const url = getImageUrl(photo._id);
                return (
                  <PolaroidCard
                    key={photo._id}
                    photo={photo}
                    url={url}
                    onOpen={() =>
                      setOpenIndex(filtered.findIndex((p) => p._id === photo._id))
                    }
                    onToggleFavorite={() => toggleFavorite(photo._id)}
                  />
                );
              })}
            </div>

            {visible < filtered.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  Show {Math.min(PAGE_SIZE, filtered.length - visible)} more memories
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="relative z-10 border-t border-border/60 bg-secondary/50">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-hand text-4xl leading-snug text-foreground/85">
            “I could keep a thousand more. I'll keep them all.”
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span>For Purnima</span>
            <span className="text-primary">❦</span>
            <button
              type="button"
              onClick={() => {
                lockAlbum();
                window.location.reload();
              }}
              className="uppercase tracking-[0.22em] transition hover:text-primary"
            >
              Lock again
            </button>
          </div>
        </div>
      </footer>

      {openIndex !== null && (
        <Lightbox
          photos={filtered}
          index={openIndex}
          urlFor={getImageUrl}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-card text-foreground/65 hover:border-primary hover:text-primary"
      }`}
    >
      {icon && <Heart className={`size-3.5 ${active ? "fill-current" : ""}`} />}
      {label}
    </button>
  );
}
