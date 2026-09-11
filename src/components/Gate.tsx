import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { useHydrated } from "@tanstack/react-router";

const PASSCODE = "meripurnima";
const STORAGE_KEY = "purnima-unlocked";
const SECRET_KEY = "purnima-secret";

export function lockAlbum() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SECRET_KEY);
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SECRET_KEY);
}

function checkUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  const storedSecret =
    sessionStorage.getItem(SECRET_KEY) || localStorage.getItem(SECRET_KEY);
  return Boolean(storedSecret && storedSecret.trim().toLowerCase() === PASSCODE);
}

export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [unlocked, setUnlocked] = useState<boolean>(checkUnlocked);

  useEffect(() => {
    setUnlocked(checkUnlocked());
  }, []);

  if (!hydrated || !unlocked) {
    return (
      <LockScreen
        onUnlock={(enteredSecret: string) => {
          sessionStorage.setItem(STORAGE_KEY, "1");
          sessionStorage.setItem(SECRET_KEY, enteredSecret);
          localStorage.setItem(STORAGE_KEY, "1");
          localStorage.setItem(SECRET_KEY, enteredSecret);
          setUnlocked(true);
        }}
      />
    );
  }

  return <>{children}</>;
}

function LockScreen({ onUnlock }: { onUnlock: (secret: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const cleaned = value.trim().toLowerCase();
    if (cleaned === PASSCODE) {
      onUnlock(cleaned);
    } else {
      setError(true);
      setValue("");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* soft candlelight glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-1/4 h-[26rem] w-[26rem] rounded-full bg-accent/25 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center">
        <div className="font-hand text-3xl text-primary">for Purnima</div>
        <h1 className="mt-6 font-display text-4xl leading-tight text-foreground md:text-5xl">
          Before you come in,
          <br />
          <span className="italic text-primary">a little note…</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[36ch] text-pretty leading-relaxed text-muted-foreground">
          Every photo behind this door is a moment I never want to forget — and
          almost all of them are you. Whisper our secret words and come see.
        </p>

        <form onSubmit={submit} className="mt-10">
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="our secret words"
            autoFocus
            aria-label="Passcode"
            className={`w-full rounded-xl border bg-card px-5 py-3.5 text-center font-hand text-2xl tracking-wide text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/25 ${
              error ? "animate-shake border-destructive" : "border-border"
            }`}
          />
          {error && (
            <p className="mt-3 font-hand text-xl text-destructive">
              that's not it, my love — try again
            </p>
          )}
          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Open our album <span aria-hidden>❦</span>
          </button>
        </form>
      </div>
    </div>
  );
}
