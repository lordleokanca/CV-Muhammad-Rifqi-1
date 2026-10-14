"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Mail, MapPin } from "lucide-react";
import Timeline from "@/components/ui/timeline";
import { DownloadCv } from "@/components/cv/download-cv";
import { cv, timelineItems, type Lang } from "@/lib/cv";
import { asset, cn } from "@/lib/utils";

const STORAGE_KEY = "cv-lang";

export function CvPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "id") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const L = cv[lang];
  const lb = L.labels;
  const c = cv.common;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(c.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div role="group" aria-label="Language / Bahasa" className="inline-flex gap-0.5 rounded-full border p-1">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors",
                  lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <DownloadCv lang={lang} />
        </div>
      </div>

      <main className="overflow-x-clip">
        {/* Hero */}
        <header className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-20">
          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 flex-col gap-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{L.eyebrow}</p>
              <h1 className="font-display text-[clamp(3rem,10vw,8rem)] font-extrabold leading-[0.88] tracking-[-0.035em]">
                Muhammad <span className="block text-primary">Rifqi</span>
              </h1>
              <p className="text-xl font-medium sm:text-2xl">{L.role}</p>
              <p className="font-mono text-sm text-muted-foreground">{L.status}</p>
              <ul className="flex flex-wrap gap-2">
                {L.focus.map((f) => (
                  <li key={f} className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/photo.jpg")}
              alt={c.name}
              width={345}
              height={491}
              className="order-first w-36 rounded-md bg-primary object-cover md:order-none md:w-56"
            />
          </div>

          <p className="mt-8 max-w-[65ch] text-[17px] leading-relaxed text-muted-foreground">{L.summary}</p>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t pt-5 text-[15px]">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">{lb.location}: </span>
              {c.location}
            </span>
            <span className="inline-flex min-w-0 items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">{lb.email}: </span>
              <span className="select-all break-all">{c.email}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? lb.copied : lb.copy}
              </button>
            </span>
          </div>
        </header>

        {/* Timeline — remounted on language change so GSAP rebuilds cleanly */}
        <Timeline
          key={lang}
          items={timelineItems(lang)}
          title={lb.timelineTitle}
          periodLabel="2021 — 2026"
          imageUrl={asset("/photo.jpg")}
          imageAlt={c.name}
          duration={1.4}
        />

        {/* Details */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-4xl font-semibold tracking-tight">{lb.details}</h2>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{lb.detailsSub}</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card title={lb.experience} wide>
              <EntryTop title={L.experience.company} when={L.experience.when} />
              <p className="text-muted-foreground">{L.experience.role}</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {L.experience.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Card>

            <Card title={lb.project} wide>
              <EntryTop title={L.project.title} when={L.project.when} />
              {L.project.orig && <p className="text-muted-foreground" lang="id">{L.project.orig}</p>}
              <p className="text-muted-foreground">{L.project.note}</p>
              <p className="font-mono text-[13px] text-primary">min_cluster_size · density · noise → optimal parameters</p>
            </Card>

            <Card title={lb.education}>
              <EntryTop title={L.education.school} when={L.education.when} />
              <p className="text-muted-foreground">{L.education.degree}</p>
              <p className="text-muted-foreground">{L.education.grad}</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{lb.gpa}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border" role="img" aria-label={`${lb.gpa} ${L.education.gpa}`}>
                  <div className="h-full bg-primary" style={{ width: `${(3.46 / 4) * 100}%` }} />
                </div>
                <b className="font-mono font-medium tabular-nums">{L.education.gpa.split(" (")[0]}</b>
              </div>
            </Card>

            <Card title={lb.skills}>
              <p className="text-muted-foreground">{lb.skillsNote}</p>
              <dl className="divide-y">
                {L.skills.map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3">
                    <dt className="pt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title={lb.courses}>
              <div className="divide-y">
                {L.courses.map(([t, o, d]) => (
                  <div key={t} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-2.5 first:pt-0">
                    <strong className="font-semibold">{t}</strong>
                    <span className="font-mono text-[13px] text-muted-foreground tabular-nums">{d}</span>
                    <span className="text-muted-foreground">{o}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{lb.certs}</p>
            </Card>

            <Card title={lb.org}>
              <EntryTop title={L.org.name} when={L.org.when} />
              <p className="text-muted-foreground">{L.org.role}</p>
              <dl className="mt-2 divide-y">
                <div className="grid gap-1 py-2.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{lb.languages}</dt>
                  <dd>{L.langs}</dd>
                </div>
                <div className="grid gap-1 py-2.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{lb.interests}</dt>
                  <dd>{L.interests}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
          {c.name} · Balaraja, Tangerang · 2026
        </div>
      </footer>
    </div>
  );
}

function Card({ title, wide, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <article className={cn("flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground", wide && "md:col-span-2")}>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {children}
    </article>
  );
}

function EntryTop({ title, when }: { title: string; when: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h4 className="font-display text-lg font-semibold">{title}</h4>
      <span className="whitespace-nowrap font-mono text-[13px] text-muted-foreground tabular-nums">{when}</span>
    </div>
  );
}
