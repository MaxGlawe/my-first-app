"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gem,
  Headphones,
  PenLine,
  ShieldCheck,
  AlertTriangle,
  Siren,
  CalendarClock,
  RotateCcw,
  Printer,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import type {
  CheckGroup,
  ContentBlock,
  ExerciseBlock,
  NoteField,
  RedflagSelfcheckExercise,
  Urgency,
  WorkbookData,
} from "@/lib/masterclass/workbook/types";
import { sourceSerif } from "./fonts";

// ── Editorial-Premium-Palette ────────────────────────────────────────────────
const PAPER = "#F8F5F0"; // warmes Off-White (Bühne)
const PAPER_RAISED = "#FCFAF6"; // leicht erhöhte Flächen (Karten)
const INK = "#0f172a"; // tiefe Tinte
const INK_SOFT = "#1e293b";
const MUTED = "#6b7280";
const GREEN = "#2C3E2D"; // Anthrazit-Grün (Akzent)
const SAND = "#C9B79C"; // Intro-Modul-Orientierungsfarbe
const LINE = "#E6DFD3";
const LINE_SOFT = "#EFE9DD";

// Auswertungs-Töne (nur für die Auswertung verwendet)
const TONE = {
  sofort: { fg: "#9f1239", bg: "#FCEEF0", ring: "#E11D48", soft: "#FBE3E6" },
  zeitnah: { fg: "#92400e", bg: "#FBF1E3", ring: "#D97706", soft: "#F8E8D2" },
  rheuma: { fg: "#92400e", bg: "#FBF4E6", ring: "#CA8A04", soft: "#F6EDD6" },
  ok: { fg: "#1f513a", bg: "#EDF3EC", ring: "#3F7A5C", soft: "#E2EEDF" },
} as const;

const STORAGE_PREFIX = "praxis_workbook_";

interface SavedState {
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  choices: Record<string, string>;
  scales: Record<string, number>;
}

/** Setter-Bündel, das an die Übungs-Blöcke durchgereicht wird. */
interface FieldState {
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  choices: Record<string, string>;
  scales: Record<string, number>;
  toggle: (id: string) => void;
  setNote: (id: string, value: string) => void;
  setChoice: (id: string, value: string) => void;
  setScale: (id: string, value: number) => void;
}

// ── Reduced-motion-Hook ────────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// ── Scroll-Reveal (subtil, respektiert reduced-motion) ──────────────────────────
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`wb-reveal ${className ?? ""}`}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(18px)",
        transition: reduced
          ? "none"
          : `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// ── Haupt-Komponente ────────────────────────────────────────────────────────────
export default function WorkbookClient({ data }: { data: WorkbookData }) {
  const storageKey = `${STORAGE_PREFIX}${data.lessonId}`;
  const reduced = usePrefersReducedMotion();

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [scales, setScales] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Laden aus localStorage (einmalig, rückwärtskompatibel: fehlende Felder = {}).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedState>;
        if (parsed.checks) setChecks(parsed.checks);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.choices) setChoices(parsed.choices);
        if (parsed.scales) setScales(parsed.scales);
      }
    } catch {
      /* korruptes JSON ignorieren */
    }
    setHydrated(true);
  }, [storageKey]);

  // Speichern (debounced „gespeichert"-Hinweis).
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: SavedState = { checks, notes, choices, scales };
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setSavedFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1600);
    } catch {
      /* Speicher voll / privater Modus → still ignorieren */
    }
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [checks, notes, choices, scales, hydrated, storageKey]);

  const toggle = useCallback((id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setNote = useCallback((id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setChoice = useCallback((id: string, value: string) => {
    setChoices((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setScale = useCallback((id: string, value: number) => {
    setScales((prev) => ({ ...prev, [id]: value }));
  }, []);

  const fieldState: FieldState = useMemo(
    () => ({ checks, notes, choices, scales, toggle, setNote, setChoice, setScale }),
    [checks, notes, choices, scales, toggle, setNote, setChoice, setScale],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const exercise = data.exercise;

  return (
    <main
      className={`${sourceSerif.variable} wb-root relative min-h-[100dvh] w-full overflow-x-hidden`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* Druck-Kopf — nur beim Drucken sichtbar */}
      <div className="wb-print-only" style={{ marginBottom: "8mm" }}>
        <p
          style={{
            fontSize: "9pt",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b7280",
          }}
        >
          Praxis OS · Masterclass Chronischer Kreuzschmerz
        </p>
        <p
          style={{
            fontSize: "12pt",
            color: "#111827",
            marginTop: "2mm",
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
          }}
        >
          Workbook · Lektion {data.nr} — {data.title}
        </p>
        <div style={{ height: "1px", background: "#cbd5e1", marginTop: "4mm" }} />
      </div>

      {/* dezente Sand-Aura oben (Intro-Modul-Orientierung) */}
      <div
        aria-hidden
        className="wb-no-print pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${SAND}26 0%, ${SAND}0d 38%, transparent 70%)`,
        }}
      />

      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(248,245,240,0.82)",
          borderBottom: `1px solid ${LINE_SOFT}`,
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <Link
            href={`/masterclass/chronischer-kreuzschmerz/${data.lessonId}`}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
            style={{ color: MUTED }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Zur Lektion {data.nr}</span>
            <span className="sm:hidden">Lektion {data.nr}</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <SavedBadge active={savedFlash} hydrated={hydrated} reduced={reduced} />
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-[rgba(44,62,45,0.06)]"
              style={{ borderColor: LINE, color: GREEN }}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Drucken / Als PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-10 pt-16 text-center md:pt-24">
        <Reveal>
          <p
            className="mb-7 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em]"
            style={{ color: GREEN }}
          >
            <span
              className="inline-block h-[7px] w-[7px] rounded-full"
              style={{ backgroundColor: SAND }}
            />
            Workbook · {data.sectionLabel}
          </p>

          <p
            className="mb-5 text-sm uppercase tracking-[0.24em]"
            style={{ color: MUTED }}
          >
            Lektion {data.nr}
          </p>

          <h1
            className="text-balance text-[2.4rem] leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-[3.6rem]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            {data.title}
          </h1>

          <p
            className="mx-auto mt-7 max-w-xl text-pretty text-lg italic leading-relaxed md:text-xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: INK_SOFT }}
          >
            {data.subtitle}
          </p>

          <div
            className="mx-auto my-9 h-px w-14"
            style={{ backgroundColor: SAND }}
          />

          <div
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-[13px]"
            style={{ color: MUTED }}
          >
            <span className="inline-flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              {data.meta.audio}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {data.meta.lese}
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN }}
            >
              <PenLine className="h-3.5 w-3.5" />
              {data.meta.uebung}
            </span>
          </div>
        </Reveal>
      </section>

      {/* ── Lernziele ── */}
      <SectionShell>
        <Reveal>
          <Eyebrow icon={ShieldCheck}>Lernziele dieser Lektion</Eyebrow>
          <p className="mt-3 text-[15px]" style={{ color: MUTED }}>
            Nach dem Durcharbeiten dieser Lektion sollst du:
          </p>
          <ol className="mt-7 flex flex-col gap-px overflow-hidden rounded-2xl border" style={{ borderColor: LINE }}>
            {data.objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-5 px-5 py-5 md:px-7"
                style={{
                  backgroundColor: PAPER_RAISED,
                  borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined,
                }}
              >
                <span
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] tabular-nums"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 600,
                    backgroundColor: "rgba(201,183,156,0.22)",
                    color: GREEN,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[16px] leading-[1.6]"
                  style={{ color: INK_SOFT }}
                >
                  {obj}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </SectionShell>

      {/* ── Lese-Teil ── */}
      <div className="mx-auto w-full max-w-3xl px-6">
        {data.content.map((block, i) => (
          <ContentRenderer key={i} block={block} />
        ))}
      </div>

      {/* ── Trenner zur Übung ── */}
      <SectionShell tight>
        <Reveal>
          <div
            className="wb-dark wb-card my-6 flex flex-col items-center rounded-3xl px-6 py-12 text-center"
            style={{
              background: `linear-gradient(180deg, ${GREEN} 0%, #243324 100%)`,
            }}
          >
            <span
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em]"
              style={{ backgroundColor: "rgba(201,183,156,0.2)", color: SAND }}
            >
              <PenLine className="h-3.5 w-3.5" />
              Übung {data.nr}
            </span>
            <h2
              className="text-3xl leading-tight md:text-4xl"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "#F8F5F0" }}
            >
              {exercise.title}
            </h2>
            <p
              className="mt-5 max-w-md text-sm leading-relaxed"
              style={{ color: "rgba(248,245,240,0.72)" }}
            >
              {exercise.timing}
            </p>
          </div>
        </Reveal>
      </SectionShell>

      {/* ── Übung: Dispatch über die Union ── */}
      {exercise.kind === "redflag-selfcheck" ? (
        <RedflagSelfcheckSection
          exercise={exercise}
          checks={checks}
          notes={notes}
          toggle={toggle}
          setNote={setNote}
          reduced={reduced}
        />
      ) : (
        <BlocksExerciseSection exercise={exercise} field={fieldState} />
      )}

      {/* ── Einordnung (optional, nur I.3) ── */}
      {data.einordnung && (
        <SectionShell>
          <Reveal>
            <Eyebrow icon={ShieldCheck}>
              Einordnung — was dieser Selbstcheck leistet und was nicht
            </Eyebrow>
            <p className="mt-5 text-[16px] leading-[1.7]" style={{ color: INK_SOFT }}>
              {data.einordnung.intro}
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <LeistungsCard
                title="Was er nicht leistet"
                items={data.einordnung.nichtLeistet}
                tone="muted"
              />
              <LeistungsCard
                title="Was er sehr wohl leistet"
                items={data.einordnung.sehrWohlLeistet}
                tone="green"
              />
            </div>
          </Reveal>
        </SectionShell>
      )}

      {/* ── Letzte Bemerkung (optional) ── */}
      {data.letzteBemerkung && (
        <SectionShell tight>
          <Reveal>
            <div
              className="rounded-3xl border px-7 py-9 md:px-10"
              style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
            >
              <h3
                className="text-2xl"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                {data.letzteBemerkung.title}
              </h3>
              <div className="mt-5 flex flex-col gap-4">
                {data.letzteBemerkung.body.map((p, i) => (
                  <p key={i} className="text-[16px] leading-[1.7]" style={{ color: INK_SOFT }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </SectionShell>
      )}

      {/* ── Zusammenfassung ── */}
      <SectionShell>
        <Reveal>
          <Eyebrow icon={RotateCcw}>Zusammenfassung — die Kernpunkte</Eyebrow>
          <ol className="mt-7 flex flex-col gap-4">
            {data.zusammenfassung.map((p, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] tabular-nums"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 600,
                    border: `1px solid ${SAND}`,
                    color: GREEN,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[1.65]" style={{ color: INK_SOFT }}>
                  {p}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </SectionShell>

      {/* ── Querverweise ── */}
      <SectionShell tight>
        <Reveal>
          <Eyebrow icon={ArrowUpRight}>Querverweise</Eyebrow>
          <ul className="mt-6 flex flex-col gap-px overflow-hidden rounded-2xl border" style={{ borderColor: LINE }}>
            {data.querverweise.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-4 px-5 py-4 md:px-6"
                style={{
                  backgroundColor: PAPER_RAISED,
                  borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined,
                }}
              >
                <span
                  className="mt-0.5 shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider"
                  style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN }}
                >
                  {q.label}
                </span>
                <span className="text-[15px] leading-[1.6]" style={{ color: INK_SOFT }}>
                  {q.text}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </SectionShell>

      {/* ── Großes Notizfeld ── */}
      <SectionShell>
        <Reveal>
          <Eyebrow icon={PenLine}>{data.notizfeld.label}</Eyebrow>
          <NoteBlock
            className="mt-6"
            field={data.notizfeld}
            value={notes[data.notizfeld.id] ?? ""}
            onChange={(v) => setNote(data.notizfeld.id, v)}
          />
        </Reveal>
      </SectionShell>

      {/* ── Fuß ── */}
      <footer className="mx-auto w-full max-w-3xl px-6 pb-24 pt-10">
        <div className="h-px w-full" style={{ backgroundColor: LINE }} />
        <p
          className="mt-7 text-center text-[12px] leading-relaxed"
          style={{ color: MUTED }}
        >
          {exercise.kind === "redflag-selfcheck"
            ? "Dieser Selbstcheck ist eine Orientierung, keine Diagnose und kein Heilversprechen. Er ersetzt nicht deinen Arzt oder deine Diagnostik. Deine Eingaben bleiben nur auf diesem Gerät gespeichert."
            : "Diese Lektion ist eine Orientierung, keine Diagnose und kein Heilversprechen. Sie ersetzt nicht deinen Arzt oder deine Diagnostik. Deine Eingaben bleiben nur auf diesem Gerät gespeichert."}
        </p>
        <div className="wb-no-print mt-7 flex justify-center">
          <Link
            href={`/masterclass/chronischer-kreuzschmerz/${data.lessonId}`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: GREEN }}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Lektion {data.nr}
          </Link>
        </div>
      </footer>
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Übungs-Sektion A — Red-Flag-Selbstcheck (Spezialfall I.3, unverändert)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Der vollständige Red-Flag-Selbstcheck (Anleitung · Check-Grid + Live-
 * Auswertung · Reflexion). In eine eigene Komponente extrahiert, damit
 * TypeScript die Union sauber auf `redflag-selfcheck` narrowt — Aussehen
 * und Verhalten sind unverändert gegenüber der bisherigen Inline-Version.
 */
function RedflagSelfcheckSection({
  exercise,
  checks,
  notes,
  toggle,
  setNote,
  reduced,
}: {
  exercise: RedflagSelfcheckExercise;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  toggle: (id: string) => void;
  setNote: (id: string, value: string) => void;
  reduced: boolean;
}) {
  const evaluation = useMemo(
    () => evaluate(exercise.groups, checks),
    [exercise.groups, checks],
  );
  const checkedCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks],
  );
  const resetCheck = useCallback(() => {
    const ids = new Set(exercise.groups.flatMap((g) => g.items.map((i) => i.id)));
    for (const id of ids) {
      if (checks[id]) toggle(id);
    }
  }, [exercise.groups, checks, toggle]);

  return (
    <>
      {/* ── Anleitung ── */}
      <SectionShell tight>
        <Reveal>
          <div className="flex flex-col gap-4">
            {exercise.anleitung.map((p, i) => (
              <p
                key={i}
                className="text-[16px] leading-[1.7]"
                style={{ color: INK_SOFT }}
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </SectionShell>

      {/* ── DER SELBSTCHECK (Star-Element) ── */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-4 pt-4">
        <div className="wb-check-grid grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Linke Spalte: die fünf Gruppen */}
          <div className="flex flex-col gap-7">
            {exercise.groups.map((group) => (
              <CheckGroupCard
                key={group.key}
                group={group}
                checks={checks}
                onToggle={toggle}
                triggered={evaluation.groupHits[group.key]?.triggered ?? false}
                hits={evaluation.groupHits[group.key]?.count ?? 0}
              />
            ))}
          </div>

          {/* Rechte Spalte: Live-Auswertung (sticky auf Desktop) */}
          <div className="lg:relative">
            <div className="wb-sticky lg:sticky lg:top-24">
              <LiveResult
                evaluation={evaluation}
                outcomes={exercise.outcomes}
                checkedCount={checkedCount}
                onReset={resetCheck}
                reduced={reduced}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Reflexion ── */}
      <SectionShell>
        <Reveal>
          <Eyebrow icon={RotateCcw}>Meine persönliche Reflexion</Eyebrow>
          <div className="mt-7 flex flex-col gap-7">
            {exercise.reflection.map((field) => (
              <NoteBlock
                key={field.id}
                field={field}
                value={notes[field.id] ?? ""}
                onChange={(v) => setNote(field.id, v)}
              />
            ))}
          </div>
          <p
            className="mt-7 rounded-xl border-l-2 px-5 py-4 text-[13.5px] italic leading-relaxed"
            style={{
              borderColor: SAND,
              backgroundColor: "rgba(201,183,156,0.1)",
              color: INK_SOFT,
              fontFamily: "var(--font-serif)",
            }}
          >
            {exercise.reflectionNote}
          </p>
        </Reveal>
      </SectionShell>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Übungs-Sektion B — Generische, komponierbare Block-Übung (z.B. 2.2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Rendert eine `BlocksExercise`: optionale Theorie-Rückbindung + Anleitung,
 * danach die Liste interaktiver `ExerciseBlock`s (Schritt, Text, Hinweis,
 * Bewertungs-Matrix, Zeilen, Einzel-Auswahl, Checkliste, Skala, Notiz,
 * Datum, Bild). Jeder interaktive Block persistiert über `FieldState`.
 */
function BlocksExerciseSection({
  exercise,
  field,
}: {
  exercise: Extract<WorkbookData["exercise"], { kind: "blocks" }>;
  field: FieldState;
}) {
  return (
    <>
      {/* Theorie-Rückbindung + Anleitung */}
      {(exercise.theorieRueckbindung || exercise.anleitung) && (
        <SectionShell tight>
          <Reveal>
            <div className="flex flex-col gap-4">
              {exercise.theorieRueckbindung?.map((p, i) => (
                <p key={`tr-${i}`} className="text-[16px] leading-[1.7]" style={{ color: INK_SOFT }}>
                  {p}
                </p>
              ))}
              {exercise.anleitung?.map((p, i) => (
                <p
                  key={`an-${i}`}
                  className="text-[16px] leading-[1.7]"
                  style={{ color: INK_SOFT, fontFamily: "var(--font-serif)", fontWeight: 600 }}
                >
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </SectionShell>
      )}

      {/* Die Block-Liste */}
      <SectionShell tight>
        <div className="flex flex-col gap-6">
          {exercise.blocks.map((block, i) => (
            <Reveal key={i}>
              <ExerciseBlockRenderer block={block} field={field} />
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

// ── Dispatch über die ExerciseBlock-Union ────────────────────────────────────────
function ExerciseBlockRenderer({
  block,
  field,
}: {
  block: ExerciseBlock;
  field: FieldState;
}) {
  switch (block.kind) {
    case "step":
      return (
        <div className="mt-4 flex items-center gap-3.5">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] tabular-nums"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 600,
              backgroundColor: GREEN,
              color: "#F1ECE2",
            }}
          >
            {block.n}
          </span>
          <h3
            className="text-[18px] leading-snug md:text-[20px]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            <span style={{ color: MUTED }}>Schritt {block.n} · </span>
            {block.title}
          </h3>
        </div>
      );

    case "text":
      return (
        <p className="text-[16px] leading-[1.72]" style={{ color: INK_SOFT }}>
          {block.text}
        </p>
      );

    case "hint":
      return (
        <p
          className="border-l-2 pl-4 text-[14px] italic leading-[1.65]"
          style={{ borderColor: SAND, color: MUTED, fontFamily: "var(--font-serif)" }}
        >
          {block.text}
        </p>
      );

    case "ratingMatrix":
      return <RatingMatrixBlock block={block} field={field} />;

    case "lines":
      return <LinesBlock block={block} field={field} />;

    case "singleChoice":
      return <SingleChoiceBlock block={block} field={field} />;

    case "checklist":
      return <ChecklistBlock block={block} field={field} />;

    case "scale":
      return <ScaleBlock block={block} field={field} />;

    case "note":
      return (
        <NoteBlock
          field={block.field}
          value={field.notes[block.field.id] ?? ""}
          onChange={(v) => field.setNote(block.field.id, v)}
        />
      );

    case "date":
      return <DateBlock block={block} field={field} />;

    case "image":
      return <FramedImage src={block.src} alt={block.alt} caption={block.caption} />;

    default:
      return null;
  }
}

// ── Bewertungs-Matrix (Zeilen × Spalten, je Zeile genau eine Spalte) ─────────────
function RatingMatrixBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "ratingMatrix" }>;
  field: FieldState;
}) {
  return (
    <div
      className="wb-card overflow-hidden rounded-2xl border"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      {block.label && (
        <p
          className="border-b px-5 py-3.5 text-[15px] md:px-6"
          style={{
            borderColor: LINE_SOFT,
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            color: INK,
          }}
        >
          {block.label}
        </p>
      )}
      {/* Spalten-Kopf (nur Desktop) */}
      <div
        className="hidden border-b px-5 py-2.5 md:grid md:px-6"
        style={{
          borderColor: LINE_SOFT,
          gridTemplateColumns: `minmax(0,1fr) repeat(${block.columns.length}, 7rem)`,
        }}
      >
        <span />
        {block.columns.map((c, i) => (
          <span
            key={i}
            className="text-center text-[11px] font-medium uppercase tracking-[0.1em]"
            style={{ color: MUTED }}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="flex flex-col">
        {block.rows.map((row, ri) => {
          const selected = field.choices[`${block.id}:${row.id}`];
          return (
            <div
              key={row.id}
              className="px-5 py-3.5 md:grid md:items-center md:px-6"
              style={{
                borderTop: ri > 0 ? `1px solid ${LINE_SOFT}` : undefined,
                gridTemplateColumns: `minmax(0,1fr) repeat(${block.columns.length}, 7rem)`,
              }}
            >
              <span className="text-[15px] leading-snug" style={{ color: INK_SOFT, fontWeight: 600 }}>
                {row.label}
              </span>
              <div
                className="mt-3 grid gap-2 md:contents md:mt-0"
                style={{ gridTemplateColumns: `repeat(${block.columns.length}, 1fr)` }}
              >
                {block.columns.map((col, ci) => {
                  const value = String(ci);
                  const active = selected === value;
                  return (
                    <button
                      key={ci}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`${row.label}: ${col}`}
                      onClick={() => field.setChoice(`${block.id}:${row.id}`, value)}
                      className="flex items-center justify-center gap-2 rounded-xl py-2 transition-colors md:gap-0 md:py-1.5"
                      style={{
                        backgroundColor: active ? "rgba(44,62,45,0.08)" : "transparent",
                      }}
                    >
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all"
                        style={{
                          border: `1.5px solid ${active ? GREEN : "#cbd0c9"}`,
                          backgroundColor: active ? GREEN : "transparent",
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: "#fff", opacity: active ? 1 : 0 }}
                        />
                      </span>
                      {/* Spalten-Label auf Mobil neben dem Radio */}
                      <span
                        className="text-[13px] md:hidden"
                        style={{ color: active ? GREEN : MUTED, fontWeight: active ? 600 : 400 }}
                      >
                        {col}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Freitext-Zeilen (prefix + Input, optional mid + zweiter Input) ───────────────
function LinesBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "lines" }>;
  field: FieldState;
}) {
  return (
    <div>
      {block.label && (
        <p
          className="mb-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.label}
        </p>
      )}
      <div className="flex flex-col gap-3.5">
        {block.lines.map((line) => {
          const keyA = line.mid ? `${block.id}.${line.id}.a` : `${block.id}.${line.id}`;
          const keyB = `${block.id}.${line.id}.b`;
          const valA = field.notes[keyA] ?? "";
          const valB = field.notes[keyB] ?? "";
          return (
            <div key={line.id} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
              {line.prefix && (
                <span
                  className="shrink-0 text-[15px]"
                  style={{ color: INK_SOFT, fontWeight: 600 }}
                >
                  {line.prefix}
                </span>
              )}
              <LineInput
                value={valA}
                onChange={(v) => field.setNote(keyA, v)}
                grow={!line.mid}
              />
              {line.mid && (
                <>
                  <span className="shrink-0 text-[15px]" style={{ color: MUTED }}>
                    {line.mid}
                  </span>
                  <LineInput value={valB} onChange={(v) => field.setNote(keyB, v)} grow />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Eine Schreib-Zeile: Eingabe am Bildschirm, getippter Text / Linie im Druck. */
function LineInput({
  value,
  onChange,
  grow,
}: {
  value: string;
  onChange: (v: string) => void;
  grow?: boolean;
}) {
  return (
    <span className={grow ? "min-w-[8rem] flex-1" : "min-w-[3.5rem]"} style={{ flexBasis: grow ? "8rem" : undefined }}>
      <span className="wb-screen-only block">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 border-b bg-transparent px-1 py-1 text-[15px] outline-none focus:border-b-2"
          style={{ borderColor: LINE, color: INK_SOFT, borderBottomColor: value ? GREEN : LINE }}
        />
      </span>
      <span className="wb-print-only block">
        {value.trim() ? (
          <span
            className="inline-block w-full px-1 text-[15px]"
            style={{ color: INK_SOFT, borderBottom: "1px solid #cbd5e1" }}
          >
            {value}
          </span>
        ) : (
          <span
            className="inline-block w-full"
            style={{ borderBottom: "1px solid #cbd5e1", height: "1.5rem" }}
          />
        )}
      </span>
    </span>
  );
}

// ── Einzel-Auswahl (Radio, optional mit Beschreibung) ────────────────────────────
function SingleChoiceBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "singleChoice" }>;
  field: FieldState;
}) {
  const selected = field.choices[block.id];
  return (
    <div>
      {block.label && (
        <p
          className="mb-3 text-[15px]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.label}
        </p>
      )}
      <div className="flex flex-col gap-2.5">
        {block.options.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => field.setChoice(block.id, opt.id)}
              className="wb-card flex w-full items-start gap-3.5 rounded-2xl border px-5 py-4 text-left transition-colors"
              style={{
                borderColor: active ? GREEN : LINE,
                backgroundColor: active ? "rgba(44,62,45,0.06)" : PAPER_RAISED,
              }}
            >
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all"
                style={{
                  border: `1.5px solid ${active ? GREEN : "#cbd0c9"}`,
                  backgroundColor: active ? GREEN : "transparent",
                }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: "#fff", opacity: active ? 1 : 0 }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[16px]"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: active ? GREEN : INK }}
                >
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="mt-0.5 block text-[14.5px] leading-[1.55]" style={{ color: INK_SOFT }}>
                    {opt.description}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Checkliste (mehrfach ankreuzbar, optional Fortschritt) ────────────────────────
function ChecklistBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "checklist" }>;
  field: FieldState;
}) {
  const done = block.items.filter((it) => field.checks[`${block.id}.${it.id}`]).length;
  return (
    <div
      className="wb-card overflow-hidden rounded-2xl border"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      {(block.label || block.showProgress) && (
        <div
          className="flex items-center justify-between gap-3 border-b px-5 py-3.5 md:px-6"
          style={{ borderColor: LINE_SOFT }}
        >
          {block.label && (
            <p
              className="text-[15px]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              {block.label}
            </p>
          )}
          {block.showProgress && (
            <span className="shrink-0 text-[12px] tabular-nums" style={{ color: MUTED }}>
              {done} / {block.items.length}
            </span>
          )}
        </div>
      )}
      <ul className="flex flex-col px-3 py-2 md:px-4">
        {block.items.map((it) => {
          const id = `${block.id}.${it.id}`;
          const active = !!field.checks[id];
          return (
            <li key={it.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => field.toggle(id)}
                className="flex w-full items-start gap-3.5 rounded-xl px-3 py-3 text-left transition-colors"
                style={{ backgroundColor: active ? "rgba(44,62,45,0.05)" : "transparent" }}
              >
                <span
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all"
                  style={{
                    border: `1.5px solid ${active ? GREEN : "#cbd0c9"}`,
                    backgroundColor: active ? GREEN : "transparent",
                  }}
                >
                  <Check
                    className="h-3.5 w-3.5"
                    style={{ color: "#fff", opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.4)" }}
                  />
                </span>
                <span className="text-[15px] leading-[1.55]" style={{ color: INK_SOFT }}>
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Skala (Range-Slider min..max mit Pol-Beschriftung) ───────────────────────────
function ScaleBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "scale" }>;
  field: FieldState;
}) {
  const min = block.min ?? 0;
  const max = block.max ?? 10;
  const stored = field.scales[block.id];
  const value = typeof stored === "number" ? stored : Math.round((min + max) / 2);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      className="wb-card rounded-2xl border px-5 py-5 md:px-6"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="text-[15px]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.label}
        </p>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-[14px] tabular-nums"
          style={{ backgroundColor: "rgba(44,62,45,0.08)", color: GREEN, fontWeight: 600 }}
        >
          {value}
        </span>
      </div>
      <div className="wb-screen-only mt-4">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => field.setScale(block.id, Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: GREEN }}
          aria-label={block.label}
        />
      </div>
      {/* Druck-Variante: statische Skala mit markiertem Wert */}
      <div className="wb-print-only mt-4">
        <div className="relative h-2 w-full rounded-full" style={{ backgroundColor: LINE }}>
          <span
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
            style={{ left: `calc(${pct}% - 0.5rem)`, backgroundColor: GREEN }}
          />
        </div>
      </div>
      {(block.minLabel || block.maxLabel) && (
        <div className="mt-2.5 flex items-center justify-between text-[12.5px]" style={{ color: MUTED }}>
          <span>{block.minLabel}</span>
          <span>{block.maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// ── Datum-/Kurzfeld (einzeilig) ───────────────────────────────────────────────────
function DateBlock({
  block,
  field,
}: {
  block: Extract<ExerciseBlock, { kind: "date" }>;
  field: FieldState;
}) {
  const value = field.notes[block.id] ?? "";
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
      <span
        className="shrink-0 text-[15px]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
      >
        {block.label}:
      </span>
      <span className="min-w-[10rem] flex-1" style={{ flexBasis: "10rem", maxWidth: "16rem" }}>
        <LineInput value={value} onChange={(v) => field.setNote(block.id, v)} grow />
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Auswertungs-Logik
// ════════════════════════════════════════════════════════════════════════════

interface Evaluation {
  level: Urgency;
  groupHits: Record<string, { count: number; triggered: boolean }>;
  anyChecked: boolean;
}

function evaluate(
  groups: CheckGroup[],
  checks: Record<string, boolean>,
): Evaluation {
  const groupHits: Evaluation["groupHits"] = {};
  let sofort = false;
  let zeitnah = false;
  let rheuma = false;
  let anyChecked = false;

  for (const group of groups) {
    const count = group.items.filter((it) => checks[it.id]).length;
    const need = group.triggerCount ?? 1;
    const triggered = count >= need;
    groupHits[group.key] = { count, triggered };
    if (count > 0) anyChecked = true;
    if (triggered) {
      if (group.urgency === "sofort") sofort = true;
      else if (group.urgency === "zeitnah") zeitnah = true;
      else if (group.urgency === "rheuma") rheuma = true;
    }
  }

  // Priorität: sofort > zeitnah > rheuma > ok
  const level: Urgency = sofort
    ? "sofort"
    : zeitnah
      ? "zeitnah"
      : rheuma
        ? "rheuma"
        : "ok";

  return { level, groupHits, anyChecked };
}

// ════════════════════════════════════════════════════════════════════════════
// Live-Auswertungs-Panel
// ════════════════════════════════════════════════════════════════════════════

const LEVEL_ICON: Record<Urgency, LucideIcon> = {
  sofort: Siren,
  zeitnah: CalendarClock,
  rheuma: CalendarClock,
  ok: CheckCircle2,
};

function LiveResult({
  evaluation,
  outcomes,
  checkedCount,
  onReset,
  reduced,
}: {
  evaluation: Evaluation;
  outcomes: RedflagSelfcheckExercise["outcomes"];
  checkedCount: number;
  onReset: () => void;
  reduced: boolean;
}) {
  const level = evaluation.level;
  const tone = TONE[level];
  const Icon = LEVEL_ICON[level];
  const outcome = outcomes.find((o) => o.level === level);

  // sanfter Wechsel: key auf level → re-mount + fade
  return (
    <div
      className="wb-card rounded-3xl border p-5 md:p-6"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: MUTED }}
        >
          Live-Auswertung
        </p>
        <span className="text-[11px] tabular-nums" style={{ color: MUTED }}>
          {checkedCount} angekreuzt
        </span>
      </div>

      <div
        key={level}
        className="mt-4 rounded-2xl p-5"
        style={{
          backgroundColor: tone.bg,
          border: `1px solid ${tone.soft}`,
          animation: reduced ? undefined : "wb-result-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div className="flex items-start gap-3.5">
          <span
            className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: tone.ring, color: "#fff" }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p
              className="text-[15px] leading-snug"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 600,
                color: tone.fg,
              }}
            >
              {outcome?.heading}
            </p>
          </div>
        </div>
        <p
          className="mt-3.5 text-[13.5px] leading-[1.6]"
          style={{ color: INK_SOFT }}
        >
          {outcome?.body}
        </p>
      </div>

      {/* Dezenter Gruppen-Spiegel */}
      <ul className="mt-4 flex flex-col gap-1.5">
        {Object.entries(evaluation.groupHits).map(([key, hit]) => (
          <li
            key={key}
            className="flex items-center justify-between gap-2 text-[12px]"
            style={{ color: hit.triggered ? INK : MUTED }}
          >
            <span className="truncate">{key}</span>
            <span
              className="inline-flex items-center gap-1.5 tabular-nums"
              style={{ color: hit.triggered ? TONE.sofort.ring : MUTED }}
            >
              {hit.count > 0 ? `${hit.count} Ja` : "–"}
              {hit.triggered && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "currentColor" }}
                />
              )}
            </span>
          </li>
        ))}
      </ul>

      {checkedCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="wb-no-print mt-5 inline-flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60"
          style={{ color: MUTED }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Auswahl zurücksetzen
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Selbstcheck-Gruppe (Karte mit ankreuzbaren Items)
// ════════════════════════════════════════════════════════════════════════════

function CheckGroupCard({
  group,
  checks,
  onToggle,
  triggered,
  hits,
}: {
  group: CheckGroup;
  checks: Record<string, boolean>;
  onToggle: (id: string) => void;
  triggered: boolean;
  hits: number;
}) {
  const tone = TONE[group.urgency === "rheuma" ? "rheuma" : group.urgency];
  const n = group.key.replace(/\D/g, "");

  return (
    <Reveal>
      <section
        className="wb-card overflow-hidden rounded-3xl border transition-colors"
        style={{
          borderColor: triggered ? tone.ring : LINE,
          backgroundColor: PAPER_RAISED,
          boxShadow: triggered
            ? `0 0 0 1px ${tone.ring}, 0 10px 30px -18px ${tone.ring}`
            : "0 1px 2px rgba(15,23,42,0.03)",
        }}
      >
        {/* Kopf */}
        <header
          className="flex items-center gap-4 border-b px-5 py-4 md:px-7"
          style={{ borderColor: LINE_SOFT }}
        >
          <span
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg tabular-nums"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 600,
              backgroundColor: triggered ? tone.soft : "rgba(201,183,156,0.18)",
              color: triggered ? tone.fg : GREEN,
            }}
          >
            {n}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="text-[18px] leading-snug md:text-[19px]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              {group.title}
            </h3>
            {group.caption && (
              <p
                className="mt-0.5 text-[11px] uppercase tracking-[0.16em]"
                style={{ color: MUTED }}
              >
                {group.caption}
              </p>
            )}
          </div>
          {hits > 0 && (
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums"
              style={{ backgroundColor: tone.soft, color: tone.fg }}
            >
              {hits} Ja
            </span>
          )}
        </header>

        {group.intro && (
          <p
            className="px-5 pt-4 text-[14px] leading-[1.6] md:px-7"
            style={{ color: MUTED }}
          >
            {group.intro}
          </p>
        )}

        {/* Items */}
        <ul className="flex flex-col px-3 py-3 md:px-4">
          {group.items.map((item) => {
            const active = !!checks[item.id];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => onToggle(item.id)}
                  className="group flex w-full items-start gap-4 rounded-2xl px-3 py-3.5 text-left transition-colors md:px-4"
                  style={{
                    backgroundColor: active ? tone.bg : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "rgba(201,183,156,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Custom-Toggle */}
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all"
                    style={{
                      border: `1.5px solid ${active ? tone.ring : "#cbd0c9"}`,
                      backgroundColor: active ? tone.ring : "transparent",
                    }}
                  >
                    <Check
                      className="h-3.5 w-3.5 transition-transform"
                      style={{
                        color: "#fff",
                        transform: active ? "scale(1)" : "scale(0.4)",
                        opacity: active ? 1 : 0,
                      }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="mr-2 text-[12px] tabular-nums"
                      style={{ color: active ? tone.fg : MUTED, fontWeight: 600 }}
                    >
                      {item.id}
                    </span>
                    <span
                      className="text-[15px] leading-[1.55]"
                      style={{ color: INK_SOFT }}
                    >
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Dringlichkeits-Fuß */}
        <div
          className="flex items-start gap-2.5 border-t px-5 py-3.5 md:px-7"
          style={{
            borderColor: LINE_SOFT,
            backgroundColor: triggered ? tone.bg : "transparent",
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: tone.ring }}
          />
          <p className="text-[13px] leading-[1.5]" style={{ color: INK_SOFT }}>
            <span style={{ fontWeight: 600, color: tone.fg }}>Dringlichkeit: </span>
            {group.dringlichkeit}
          </p>
        </div>
      </section>
    </Reveal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Lese-Teil-Renderer
// ════════════════════════════════════════════════════════════════════════════

function ContentRenderer({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "heading":
      return (
        <SectionShell tight>
          <Reveal>
            {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
            <h2
              className="mt-3 text-balance text-[1.9rem] leading-[1.15] tracking-[-0.015em] md:text-[2.4rem]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              {block.text}
            </h2>
          </Reveal>
        </SectionShell>
      );

    case "subheading":
      return (
        <SectionShell tight>
          <Reveal>
            <h3
              className="text-xl md:text-2xl"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
            >
              {block.text}
            </h3>
          </Reveal>
        </SectionShell>
      );

    case "lead":
      return (
        <Prose>
          <Reveal>
            <p
              className="text-pretty text-[1.3rem] leading-[1.55] md:text-[1.5rem]"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: INK }}
            >
              {block.text}
            </p>
          </Reveal>
        </Prose>
      );

    case "paragraph":
      return (
        <Prose>
          <Reveal>
            <p className="text-[17px] leading-[1.72]" style={{ color: INK_SOFT }}>
              {block.text}
            </p>
          </Reveal>
        </Prose>
      );

    case "callout":
      return (
        <Prose>
          <Reveal>
            <p
              className="border-l-2 pl-5 text-[17px] italic leading-[1.7]"
              style={{ borderColor: SAND, color: INK_SOFT, fontFamily: "var(--font-serif)" }}
            >
              {block.text}
            </p>
          </Reveal>
        </Prose>
      );

    case "vertiefung":
      return (
        <Prose>
          <Reveal>
            <VertiefungPanel title={block.title} body={block.body} />
          </Reveal>
        </Prose>
      );

    case "vignette":
      return (
        <Prose>
          <Reveal>
            <VignetteCard title={block.title} body={block.body} />
          </Reveal>
        </Prose>
      );

    case "flagGroup":
      return (
        <SectionShell tight>
          <Reveal>
            <FlagGroupRead block={block} />
          </Reveal>
        </SectionShell>
      );

    case "yellowFlags":
      return (
        <SectionShell tight>
          <Reveal>
            <YellowFlagsBlock block={block} />
          </Reveal>
        </SectionShell>
      );

    case "abklaerung":
      return (
        <SectionShell tight>
          <Reveal>
            <ol className="flex flex-col gap-px overflow-hidden rounded-2xl border" style={{ borderColor: LINE }}>
              {block.steps.map((s, i) => (
                <li
                  key={i}
                  className="px-5 py-5 md:px-7"
                  style={{
                    backgroundColor: PAPER_RAISED,
                    borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined,
                  }}
                >
                  <p
                    className="text-[16px]"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-[1.65]" style={{ color: INK_SOFT }}>
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </SectionShell>
      );

    case "bulletList":
    case "numberedList":
      return (
        <Prose>
          <Reveal>
            <EditorialList block={block} />
          </Reveal>
        </Prose>
      );

    case "table":
      return (
        <SectionShell tight>
          <Reveal>
            <EditorialTable block={block} />
          </Reveal>
        </SectionShell>
      );

    case "image":
      return (
        <Prose>
          <Reveal>
            <FramedImage src={block.src} alt={block.alt} caption={block.caption} />
          </Reveal>
        </Prose>
      );

    case "keyTakeaway":
      return (
        <Prose>
          <Reveal>
            <KeyTakeaway title={block.title} body={block.body} />
          </Reveal>
        </Prose>
      );

    case "exerciseCard":
      return (
        <SectionShell tight>
          <Reveal>
            <ExerciseCard block={block} />
          </Reveal>
        </SectionShell>
      );

    default:
      return null;
  }
}

// ── Editorial-Liste (bullet / numbered) ──────────────────────────────────────────
function EditorialList({
  block,
}: {
  block: Extract<ContentBlock, { kind: "bulletList" | "numberedList" }>;
}) {
  const numbered = block.kind === "numberedList";
  return (
    <div>
      {block.title && (
        <p
          className="mb-4 text-[16px] leading-[1.6]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.title}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3.5">
            {numbered ? (
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] tabular-nums"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 600,
                  border: `1px solid ${SAND}`,
                  color: GREEN,
                }}
              >
                {i + 1}
              </span>
            ) : (
              <span
                className="mt-[0.62rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: SAND }}
              />
            )}
            <span className="text-[16.5px] leading-[1.65]" style={{ color: INK_SOFT }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Editorial-Tabelle (Off-White, dünne Linien, Anthrazit-Grün-Header) ───────────
function EditorialTable({
  block,
}: {
  block: Extract<ContentBlock, { kind: "table" }>;
}) {
  return (
    <figure>
      <div
        className="wb-card overflow-hidden rounded-2xl border"
        style={{ borderColor: LINE }}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: GREEN }}>
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.1em] md:px-5"
                  style={{ color: "#F1ECE2" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  backgroundColor: ri % 2 === 0 ? PAPER_RAISED : "rgba(201,183,156,0.06)",
                  borderTop: `1px solid ${LINE_SOFT}`,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 text-[14.5px] leading-[1.55] md:px-5"
                    style={{ color: INK_SOFT, fontWeight: ci === 0 ? 600 : 400 }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && (
        <figcaption className="mt-2.5 text-center text-[12.5px] italic" style={{ color: MUTED }}>
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Gerahmtes Foto ────────────────────────────────────────────────────────────────
function FramedImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure
      className="wb-card overflow-hidden rounded-2xl border"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block h-auto w-full"
        style={{ objectFit: "contain", backgroundColor: "#fff" }}
      />
      {caption && (
        <figcaption
          className="border-t px-4 py-3 text-center text-[12.5px] italic md:px-5"
          style={{ borderColor: LINE_SOFT, color: MUTED }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Key-Takeaway (Merksatz, Sand-Akzent) ─────────────────────────────────────────
function KeyTakeaway({ title, body }: { title?: string; body: string[] }) {
  return (
    <div
      className="wb-card rounded-2xl border-l-2 px-6 py-6 md:px-7"
      style={{ borderColor: SAND, backgroundColor: "rgba(201,183,156,0.1)" }}
    >
      <p
        className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]"
        style={{ color: GREEN }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {title ?? "Merke"}
      </p>
      <div className="mt-3.5 flex flex-col gap-3">
        {body.map((p, i) => (
          <p
            key={i}
            className="text-[16.5px] leading-[1.7]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: INK }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Übungskarte (ÜK-M1 … ÜK-M7) ───────────────────────────────────────────────────
function ExerciseCard({
  block,
}: {
  block: Extract<ContentBlock, { kind: "exerciseCard" }>;
}) {
  return (
    <article
      className="wb-card overflow-hidden rounded-3xl border"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      {/* Kopf: Code-Badge + Name */}
      <header
        className="flex items-center gap-4 border-b px-6 py-5 md:px-8"
        style={{ borderColor: LINE_SOFT }}
      >
        <span
          className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.08em]"
          style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
        >
          {block.code}
        </span>
        <h3
          className="text-[20px] leading-snug md:text-[22px]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.name}
        </h3>
      </header>

      <div className="grid gap-0 md:grid-cols-[minmax(0,260px)_1fr]">
        {/* Foto (oben mobil, links auf Desktop) */}
        {block.image && (
          <div
            className="border-b md:border-b-0 md:border-r"
            style={{ borderColor: LINE_SOFT, backgroundColor: "#fff" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.image.src}
              alt={block.image.alt}
              loading="lazy"
              className="block h-full w-full"
              style={{ objectFit: "contain", aspectRatio: "4 / 3" }}
            />
          </div>
        )}

        {/* Felder */}
        <dl className="flex flex-col px-6 py-5 md:px-8">
          {block.fields.map((f, i) => (
            <div
              key={i}
              className="py-3"
              style={{ borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined }}
            >
              <dt
                className="text-[11px] font-medium uppercase tracking-[0.16em]"
                style={{ color: GREEN }}
              >
                {f.label}
              </dt>
              {f.text && (
                <dd className="mt-1.5 text-[15px] leading-[1.62]" style={{ color: INK_SOFT }}>
                  {f.text}
                </dd>
              )}
              {f.items && (
                <dd className="mt-2 flex flex-col gap-1.5">
                  {f.items.map((it, j) => (
                    <span key={j} className="flex items-start gap-2.5">
                      <span
                        className="mt-[0.55rem] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: SAND }}
                      />
                      <span className="text-[15px] leading-[1.6]" style={{ color: INK_SOFT }}>
                        {it}
                      </span>
                    </span>
                  ))}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

// ── Vertiefung 💎 (Accordion) ───────────────────────────────────────────────────
function VertiefungPanel({ title, body }: { title: string; body: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="wb-card overflow-hidden rounded-2xl border"
      style={{
        borderColor: open ? SAND : LINE,
        backgroundColor: "rgba(201,183,156,0.07)",
        transition: "border-color 0.3s ease",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left md:px-6"
      >
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(44,62,45,0.1)", color: GREEN }}
        >
          <Gem className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ color: GREEN }}
          >
            Vertiefung
          </span>
          <span
            className="mt-0.5 block text-[16px] leading-snug"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
          >
            {title}
          </span>
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform duration-300"
          style={{ color: MUTED, transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <div
        className="wb-vertiefung-body grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3.5 px-5 pb-5 md:px-6" style={{ paddingLeft: "calc(2.25rem + 1rem)" }}>
            {body.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.7]" style={{ color: INK_SOFT }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Praxis-Vignette 📖 (Story-Karte) ─────────────────────────────────────────────
function VignetteCard({ title, body }: { title: string; body: string[] }) {
  return (
    <figure
      className="wb-dark wb-card relative overflow-hidden rounded-3xl px-7 py-8 md:px-9 md:py-9"
      style={{
        backgroundColor: "#22301F",
        color: "#EDE9E0",
      }}
    >
      <div
        aria-hidden
        className="wb-no-print pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${SAND}33 0%, transparent 70%)` }}
      />
      <figcaption
        className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em]"
        style={{ color: SAND }}
      >
        <span className="text-base leading-none">📖</span>
        Aus der Praxis
      </figcaption>
      <h4
        className="text-[22px] leading-tight md:text-[24px]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "#F8F5F0" }}
      >
        {title.replace("Aus der Praxis — ", "")}
      </h4>
      <div className="mt-5 flex flex-col gap-4">
        {body.map((p, i) => (
          <p
            key={i}
            className="text-[15.5px] leading-[1.75]"
            style={{
              color: "rgba(237,233,224,0.85)",
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </figure>
  );
}

// ── Read-only Red-Flag-Gruppe (Lese-Teil) ───────────────────────────────────────
function FlagGroupRead({
  block,
}: {
  block: Extract<ContentBlock, { kind: "flagGroup" }>;
}) {
  const tone = TONE[block.tone === "rheuma" ? "rheuma" : block.tone];
  return (
    <div
      className="wb-card overflow-hidden rounded-3xl border"
      style={{ borderColor: LINE, backgroundColor: PAPER_RAISED }}
    >
      <header className="flex items-center gap-4 px-6 py-5 md:px-8">
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl tabular-nums"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            backgroundColor: "rgba(201,183,156,0.2)",
            color: GREEN,
          }}
        >
          {block.n}
        </span>
        <h3
          className="text-[20px] leading-snug md:text-[22px]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        >
          {block.title}
        </h3>
      </header>

      {block.intro && (
        <p className="px-6 pb-2 text-[15px] leading-[1.65] md:px-8" style={{ color: MUTED }}>
          {block.intro}
        </p>
      )}

      <ul className="px-6 pb-4 md:px-8">
        {block.signals.map((s, i) => (
          <li
            key={s.code}
            className="py-4"
            style={{ borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined }}
          >
            <p className="flex items-baseline gap-2.5">
              <span
                className="shrink-0 text-[12px] tabular-nums"
                style={{ color: GREEN, fontWeight: 700 }}
              >
                {s.code}
              </span>
              <span
                className="text-[16px]"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
              >
                {s.name}
              </span>
            </p>
            <p className="mt-1.5 pl-[2.1rem] text-[15px] leading-[1.62]" style={{ color: INK_SOFT }}>
              {s.text}
            </p>
          </li>
        ))}
      </ul>

      <div
        className="flex items-start gap-2.5 px-6 py-4 md:px-8"
        style={{ backgroundColor: tone.bg, borderTop: `1px solid ${tone.soft}` }}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: tone.ring }} />
        <p className="text-[13.5px] leading-[1.55]" style={{ color: INK_SOFT }}>
          <span style={{ fontWeight: 600, color: tone.fg }}>Dringlichkeit: </span>
          {block.dringlichkeit}
        </p>
      </div>
    </div>
  );
}

// ── Yellow Flags (Tabelle als ruhige Liste) ──────────────────────────────────────
function YellowFlagsBlock({
  block,
}: {
  block: Extract<ContentBlock, { kind: "yellowFlags" }>;
}) {
  return (
    <div>
      <p className="text-[16px] leading-[1.72]" style={{ color: INK_SOFT }}>
        {block.intro}
      </p>
      <ul className="mt-7 flex flex-col gap-px overflow-hidden rounded-2xl border" style={{ borderColor: LINE }}>
        {block.rows.map((r, i) => (
          <li
            key={i}
            className="grid grid-cols-[120px_1fr] gap-3 px-5 py-3.5 md:px-6"
            style={{
              backgroundColor: PAPER_RAISED,
              borderTop: i > 0 ? `1px solid ${LINE_SOFT}` : undefined,
            }}
          >
            <span
              className="text-[13px] font-medium uppercase tracking-wider"
              style={{ color: GREEN }}
            >
              {r.area}
            </span>
            <span className="text-[15px] leading-[1.55]" style={{ color: INK_SOFT }}>
              {r.sign}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-7 text-[16px] leading-[1.72]" style={{ color: INK_SOFT }}>
        {block.outro}
      </p>
    </div>
  );
}

// ── Einordnungs-Karte (leistet / leistet nicht) ──────────────────────────────────
function LeistungsCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "muted" | "green";
}) {
  const isGreen = tone === "green";
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        borderColor: isGreen ? "rgba(44,62,45,0.25)" : LINE,
        backgroundColor: isGreen ? "rgba(44,62,45,0.05)" : PAPER_RAISED,
      }}
    >
      <h4
        className="text-[16px]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: isGreen ? GREEN : INK }}
      >
        {title}
      </h4>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: isGreen ? GREEN : SAND }}
            />
            <span className="text-[14.5px] leading-[1.6]" style={{ color: INK_SOFT }}>
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Notiz-/Reflexionsfeld ─────────────────────────────────────────────────────────
function NoteBlock({
  field,
  value,
  onChange,
  className,
}: {
  field: NoteField;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        className="block text-[15px]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}
        htmlFor={`note-${field.id}`}
      >
        {field.label}
      </label>
      {field.helper && (
        <p className="mt-1 text-[13.5px] leading-[1.55]" style={{ color: MUTED }}>
          {field.helper}
        </p>
      )}
      <div className="wb-screen-only">
        <Textarea
          id={`note-${field.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 4}
          placeholder="Hier tippen … (wird automatisch auf diesem Gerät gespeichert)"
          className="mt-3 resize-y rounded-2xl border bg-white/70 px-4 py-3.5 text-[15px] leading-[1.65] shadow-none focus-visible:ring-2"
          style={{
            borderColor: LINE,
            color: INK_SOFT,
          }}
        />
      </div>
      <div className="wb-print-only">
        {value.trim() ? (
          <p
            className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.7]"
            style={{ color: INK_SOFT }}
          >
            {value}
          </p>
        ) : (
          <div className="mt-3 flex flex-col">
            {Array.from({ length: field.rows ?? 4 }).map((_, i) => (
              <span key={i} className="wb-print-line" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── „gespeichert"-Hinweis ─────────────────────────────────────────────────────────
function SavedBadge({
  active,
  hydrated,
  reduced,
}: {
  active: boolean;
  hydrated: boolean;
  reduced: boolean;
}) {
  if (!hydrated) return <span className="h-5" />;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em]"
      style={{
        color: active ? GREEN : MUTED,
        opacity: active ? 1 : 0.55,
        transition: reduced ? undefined : "color 0.3s ease, opacity 0.3s ease",
      }}
    >
      <Check className="h-3.5 w-3.5" />
      {active ? "Gespeichert" : "Auf diesem Gerät"}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Layout-Helfer
// ════════════════════════════════════════════════════════════════════════════

/** Sektion mit Standard-Rhythmus, max-w-3xl. */
function SectionShell({
  children,
  tight,
}: {
  children: ReactNode;
  tight?: boolean;
}) {
  return (
    <section className={`mx-auto w-full max-w-3xl px-6 ${tight ? "py-6" : "py-10 md:py-14"}`}>
      {children}
    </section>
  );
}

/** Lese-Spalte mit angenehmer Zeilenbreite (~68 Zeichen). */
function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[42rem] px-6 py-4">
      <div className="mx-auto" style={{ maxWidth: "38rem" }}>
        {children}
      </div>
    </div>
  );
}

/** Kleiner Sektions-Eyebrow mit Sand-Punkt. */
function Eyebrow({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p
      className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em]"
      style={{ color: GREEN }}
    >
      {Icon ? (
        <Icon className="h-3.5 w-3.5" />
      ) : (
        <span className="inline-block h-[6px] w-[6px] rounded-full" style={{ backgroundColor: SAND }} />
      )}
      {children}
    </p>
  );
}
