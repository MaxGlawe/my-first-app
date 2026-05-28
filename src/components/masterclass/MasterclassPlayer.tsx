"use client";

/**
 * MasterclassPlayer — Premium „Podcast-PowerPoint"-Player.
 *
 * Spielt pro Abschnitt das zugehörige MP3 und zeigt die Slides des Abschnitts.
 * Wort-genaue Synchronisation: jede Slide trägt eine `appearTime` (Sekunden,
 * relativ zum Abschnitt-Audio, aus dem Wort-Alignment vorberechnet). Die Slide
 * schaltet, sobald `audio.currentTime >= slide.appearTime` (die jeweils letzte
 * Slide, deren Zeit erreicht ist). Manuelle Navigation (Vor/Zurück) überschreibt
 * das Auto-Advance bis zum nächsten Abschnittswechsel.
 * Audio-Ende → automatisch nächster Abschnitt (Audio startet, erste Slide).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  FileText,
  Wrench,
  Lightbulb,
  Activity,
  CalendarDays,
  BookOpen,
  PenLine,
  Moon,
  Check,
  Quote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  totalSlides,
  type IconKey,
  type Lesson,
  type Slide,
} from "@/lib/masterclass/types";
import lessonI1 from "@/lib/masterclass/lessons/I.1";

// ── Premium-Palette (Editorial) ──────────────────────────────────────────────
const COLORS = {
  paper: "#F8F5F0", // warmes Off-White
  ink: "#0f172a", // Anthrazit/Navy (Headlines)
  inkSoft: "#1e293b", // tiefes Slate (Fließtext)
  muted: "#64748b", // dezente Sekundärschrift
  accent: "#059669", // Praxis-Emerald
  line: "#e7e1d6", // warme Trennlinie
  dark: "#0f172a", // Anti-Slide / dunkler Bruch
};

const ICONS: Record<IconKey, typeof Wrench> = {
  toolbox: Wrench,
  understand: Lightbulb,
  exercise: Activity,
  integrate: CalendarDays,
  workbook: BookOpen,
  pen: PenLine,
  quiet: Moon,
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface MasterclassPlayerProps {
  lesson?: Lesson;
}

export default function MasterclassPlayer({
  lesson = lessonI1,
}: MasterclassPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gesamtanzahl Slides der aktuell gespielten Lektion (für „Slide X/N").
  const lessonTotalSlides = useMemo(() => totalSlides(lesson), [lesson]);

  // Aktueller Abschnitt + Slide innerhalb des Abschnitts.
  const [sectionIndex, setSectionIndex] = useState(0);
  const [slideInSection, setSlideInSection] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Manuelle Navigation überschreibt Auto-Advance bis zum nächsten Abschnitt.
  const manualOverrideRef = useRef(false);
  // Verhindert doppeltes Auto-Advance beim Abschnittswechsel.
  const advancingRef = useRef(false);

  const reducedMotion = usePrefersReducedMotion();

  const section = lesson.sections[sectionIndex];
  const slideCount = section.slides.length;
  const currentSlide = section.slides[slideInSection];

  // Globaler Slide-Index (für „Slide X/13").
  const globalSlideIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < sectionIndex; i++) idx += lesson.sections[i].slides.length;
    return idx + slideInSection;
  }, [lesson.sections, sectionIndex, slideInSection]);

  const isFirstSlideOverall = globalSlideIndex === 0;
  const isLastSlideOverall = globalSlideIndex === lessonTotalSlides - 1;

  // ── Audio laden, wenn Abschnitt wechselt ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    if (hasStarted) {
      // Beim Abschnittswechsel: Auto-Override zurücksetzen + erste Slide.
      manualOverrideRef.current = false;
      const playPromise = audio.play();
      if (playPromise) playPromise.then(() => setIsPlaying(true)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIndex]);

  // ── Lautstärke synchronisieren ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // ── Slide-Auto-Advance: wort-genau via appearTime ──
  // Aktive Slide = die letzte, deren appearTime <= currentTime ist.
  useEffect(() => {
    if (manualOverrideRef.current) return;
    if (slideCount <= 1) return;
    const slides = section.slides;
    let target = 0;
    for (let i = 0; i < slides.length; i++) {
      if (currentTime + 0.001 >= slides[i].appearTime) target = i;
      else break;
    }
    // Nur vorwärts (Auto-Advance schaltet nie zurück).
    if (target > slideInSection) setSlideInSection(target);
  }, [currentTime, slideCount, slideInSection, section.slides]);

  // ── Navigation ──
  const goToSection = useCallback(
    (nextSection: number, autoplay: boolean) => {
      if (nextSection < 0 || nextSection >= lesson.sections.length) return;
      advancingRef.current = false;
      manualOverrideRef.current = false;
      setSlideInSection(0);
      setSectionIndex(nextSection);
      if (autoplay) setHasStarted(true);
    },
    [lesson.sections.length],
  );

  const goNext = useCallback(() => {
    // Innerhalb des Abschnitts vor — oder in den nächsten Abschnitt.
    if (slideInSection < slideCount - 1) {
      manualOverrideRef.current = true;
      setSlideInSection((s) => s + 1);
    } else if (sectionIndex < lesson.sections.length - 1) {
      goToSection(sectionIndex + 1, hasStarted);
    }
  }, [
    slideInSection,
    slideCount,
    sectionIndex,
    lesson.sections.length,
    goToSection,
    hasStarted,
  ]);

  const goPrev = useCallback(() => {
    if (slideInSection > 0) {
      manualOverrideRef.current = true;
      setSlideInSection((s) => s - 1);
    } else if (sectionIndex > 0) {
      const prev = sectionIndex - 1;
      const prevCount = lesson.sections[prev].slides.length;
      advancingRef.current = false;
      manualOverrideRef.current = true; // beim Zurückspringen letzte Slide halten
      setSectionIndex(prev);
      setSlideInSection(prevCount - 1);
    }
  }, [slideInSection, sectionIndex, lesson.sections]);

  // ── Play/Pause ──
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasStarted(true);
    if (audio.paused) {
      const p = audio.play();
      if (p) p.then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // ── Audio-Events ──
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration || 0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  }, []);

  const handleEnded = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    if (sectionIndex < lesson.sections.length - 1) {
      goToSection(sectionIndex + 1, true);
    } else {
      setIsPlaying(false);
    }
  }, [sectionIndex, lesson.sections.length, goToSection]);

  // ── Scrubber ──
  // Seeken hebt die manuelle Slide-Übersteuerung auf und synchronisiert die
  // Slide sofort wieder auf die Audioposition (auch rückwärts).
  const handleSeek = useCallback(
    (value: number[]) => {
      const audio = audioRef.current;
      if (!audio || !value.length) return;
      const t = value[0];
      audio.currentTime = t;
      setCurrentTime(t);
      manualOverrideRef.current = false;
      const slides = section.slides;
      let target = 0;
      for (let i = 0; i < slides.length; i++) {
        if (t + 0.001 >= slides[i].appearTime) target = i;
        else break;
      }
      setSlideInSection(target);
    },
    [section.slides],
  );

  // ── Keyboard (Desktop) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, goNext, goPrev]);

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const transitionClass = reducedMotion
    ? ""
    : "transition-all duration-700 ease-out";

  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col"
      style={{ backgroundColor: COLORS.paper }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={section.audioSrc}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* ── Slide-Bühne ── */}
      <div className="relative flex flex-1 items-stretch justify-center overflow-hidden">
        <SlideStage
          slide={currentSlide}
          reducedMotion={reducedMotion}
          slideKey={`${sectionIndex}-${slideInSection}`}
        />

        {/* Seiten-Navigationszonen (Desktop hover) */}
        <button
          type="button"
          aria-label="Vorherige Slide"
          onClick={goPrev}
          disabled={isFirstSlideOverall}
          className={cn(
            "group absolute left-0 top-0 z-20 hidden h-full w-16 items-center justify-start pl-4 md:flex",
            "disabled:pointer-events-none disabled:opacity-0",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
            <ChevronLeft className="h-5 w-5" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Nächste Slide"
          onClick={goNext}
          disabled={isLastSlideOverall}
          className={cn(
            "group absolute right-0 top-0 z-20 hidden h-full w-16 items-center justify-end pr-4 md:flex",
            "disabled:pointer-events-none disabled:opacity-0",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-slate-700 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>

        {/* Transkript-Overlay */}
        {showTranscript && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-30 mx-auto max-h-[55%] w-full overflow-y-auto px-6 pb-10 pt-8 md:px-12",
              !reducedMotion && "animate-in slide-in-from-bottom-4 fade-in",
            )}
            style={{
              background:
                "linear-gradient(to top, rgba(248,245,240,0.98) 70%, rgba(248,245,240,0))",
            }}
          >
            <div className="mx-auto max-w-2xl">
              <p
                className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em]"
                style={{ color: COLORS.accent }}
              >
                Transkript · {section.title}
              </p>
              <p
                className="text-base leading-relaxed md:text-lg"
                style={{ color: COLORS.inkSoft }}
              >
                {section.transkript}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-Indikator (Punkte pro Abschnitt) ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pb-3 pt-2">
        {section.slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === slideInSection ? "w-6" : "w-1.5",
            )}
            style={{
              backgroundColor:
                i === slideInSection ? COLORS.accent : COLORS.line,
            }}
          />
        ))}
      </div>

      {/* ── Control-Bar ── */}
      <div
        className="border-t backdrop-blur"
        style={{ borderColor: COLORS.line, backgroundColor: "rgba(248,245,240,0.85)" }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-3 md:px-6 md:py-4">
          {/* Scrubber */}
          <div className="mb-3 flex items-center gap-3">
            <span
              className="w-10 shrink-0 text-right font-mono text-xs tabular-nums"
              style={{ color: COLORS.muted }}
            >
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              onValueChange={handleSeek}
              aria-label="Audio-Fortschritt"
              className="flex-1 [&_[data-orientation=horizontal]]:h-1 [&_.bg-primary]:bg-[#059669] [&_[role=slider]]:border-[#059669] [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5"
            />
            <span
              className="w-10 shrink-0 font-mono text-xs tabular-nums"
              style={{ color: COLORS.muted }}
            >
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons + Meta */}
          <div className="flex items-center justify-between gap-2">
            {/* Links: Slide-Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                disabled={isFirstSlideOverall}
                aria-label="Vorherige Slide"
                className="text-slate-600 hover:bg-black/5 hover:text-slate-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePlay}
                size="icon"
                aria-label={isPlaying ? "Pause" : "Abspielen"}
                className="h-12 w-12 rounded-full text-white shadow-md hover:opacity-90"
                style={{ backgroundColor: COLORS.accent }}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                disabled={isLastSlideOverall}
                aria-label="Nächste Slide"
                className="text-slate-600 hover:bg-black/5 hover:text-slate-900"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Mitte: Slide-Zähler + Abschnitt */}
            <div className="hidden min-w-0 flex-col items-center text-center sm:flex">
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: COLORS.ink }}
              >
                Slide {globalSlideIndex + 1}/{lessonTotalSlides}
              </span>
              <span
                className="truncate text-[11px]"
                style={{ color: COLORS.muted }}
              >
                Abschnitt {sectionIndex + 1} · {section.title}
              </span>
            </div>

            {/* Rechts: Transkript + Lautstärke */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTranscript((s) => !s)}
                aria-label="Transkript anzeigen"
                aria-pressed={showTranscript}
                className={cn(
                  "hover:bg-black/5",
                  showTranscript ? "text-[#059669]" : "text-slate-600",
                )}
              >
                <FileText className="h-5 w-5" />
              </Button>

              <div className="hidden items-center gap-1.5 md:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Ton an" : "Stumm"}
                  className="text-slate-600 hover:bg-black/5 hover:text-slate-900"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[muted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => {
                    setMuted(false);
                    setVolume(v[0] ?? 0);
                  }}
                  aria-label="Lautstärke"
                  className="w-20 [&_.bg-primary]:bg-slate-700 [&_[role=slider]]:border-slate-700 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
              </div>
            </div>
          </div>

          {/* Mobiler Slide-Zähler */}
          <div className="mt-2 flex items-center justify-center sm:hidden">
            <span className="text-[11px]" style={{ color: COLORS.muted }}>
              Slide {globalSlideIndex + 1}/{lessonTotalSlides} · Abschnitt{" "}
              {sectionIndex + 1} · {section.title}
            </span>
          </div>
        </div>
        {/* Dünner Gesamt-Fortschritt der Lektion */}
        <div className="h-0.5 w-full" style={{ backgroundColor: COLORS.line }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((globalSlideIndex + progress / 100) / lessonTotalSlides) * 100}%`,
              backgroundColor: COLORS.accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Slide-Bühne mit Übergang ─────────────────────────────────────────────────

function SlideStage({
  slide,
  reducedMotion,
  slideKey,
}: {
  slide: Slide;
  reducedMotion: boolean;
  slideKey: string;
}) {
  return (
    <div
      key={slideKey}
      className={cn(
        "flex w-full items-center justify-center",
        !reducedMotion && "animate-in fade-in zoom-in-[0.99] duration-700",
      )}
    >
      <SlideRenderer slide={slide} reducedMotion={reducedMotion} />
    </div>
  );
}

// ── Slide-Renderer (pro Typ) ─────────────────────────────────────────────────

function SlideRenderer({
  slide,
  reducedMotion,
}: {
  slide: Slide;
  reducedMotion: boolean;
}) {
  switch (slide.type) {
    case "title":
      return <TitleSlideView slide={slide} />;
    case "word":
      return <WordSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "visual":
      return <VisualSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "content":
      return <ContentSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "term":
      return <TermSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "quote":
      return <QuoteSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "reveal-list":
      return <RevealListSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "module":
      return <ModuleSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "list":
      return <ListSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "anti-list":
      return <AntiListSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "statement":
      return <StatementSlideView slide={slide} />;
    case "speaker":
      return <SpeakerSlideView slide={slide} />;
    case "timeline":
      return <TimelineSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "stats":
      return <StatsSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "checklist":
      return <ChecklistSlideView slide={slide} reducedMotion={reducedMotion} />;
    case "outro":
      return <OutroSlideView slide={slide} reducedMotion={reducedMotion} />;
  }
}

// Gemeinsamer Bühnen-Wrapper (Weißraum + Zentrierung).
function Stage({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center px-6 py-12 text-center md:px-16",
        className,
      )}
      style={dark ? { backgroundColor: COLORS.dark } : undefined}
    >
      {children}
    </div>
  );
}

function fontDisplay(weight = 500): React.CSSProperties {
  return { fontFamily: "var(--font-display)", fontWeight: weight };
}

// Slide 1 — Title
function TitleSlideView({
  slide,
}: {
  slide: Extract<Slide, { type: "title" }>;
}) {
  return (
    <Stage>
      <div className="mb-10 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/physio-logo.png"
          alt="Physiotherapie Glawe"
          className="h-16 w-auto opacity-90 md:h-20"
        />
      </div>
      <p
        className="text-display-sm md:text-display-md"
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.kicker}
      </p>
      <div
        className="my-8 h-px w-16"
        style={{ backgroundColor: COLORS.accent }}
      />
      <p
        className="text-sm uppercase tracking-[0.22em] md:text-base"
        style={{ color: COLORS.muted }}
      >
        {slide.lessonLabel}
      </p>
    </Stage>
  );
}

// Slides 2 & 12 — Word
function WordSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "word" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <h1
        className={cn(
          "text-display-xl",
          !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-1000",
        )}
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.word}
      </h1>
    </Stage>
  );
}

// Slide 3 — Visual (abstraktes Wirbelsäulen-/Bewegungs-Motiv, reines SVG/CSS)
function VisualSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "visual" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <div className="relative flex h-72 w-72 items-center justify-center md:h-96 md:w-96">
        {/* weicher Gradient-Halo */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(5,150,105,0.16), rgba(5,150,105,0) 70%)",
          }}
        />
        <SpineMotif animate={!reducedMotion} />
      </div>
      {slide.caption && (
        <p
          className="mt-10 text-sm uppercase tracking-[0.22em]"
          style={{ color: COLORS.muted }}
        >
          {slide.caption}
        </p>
      )}
    </Stage>
  );
}

/** Abstraktes Wirbelsäulen-/Bewegungs-Motiv aus feinen Linien + Knoten. */
function SpineMotif({ animate }: { animate: boolean }) {
  // S-Kurve der Wirbelsäule, mit „Wirbeln" als Querstriche entlang der Kurve.
  const vertebrae = Array.from({ length: 11 });
  return (
    <svg
      viewBox="0 0 200 320"
      className="relative h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#059669" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* dezente Begleitlinien (Bewegungs-Echo) */}
      <path
        d="M70 10 C 130 70, 30 150, 90 220 C 130 270, 80 300, 70 312"
        stroke="#0f172a"
        strokeOpacity="0.06"
        strokeWidth="1.2"
      />
      <path
        d="M110 10 C 170 70, 70 150, 130 220 C 170 270, 120 300, 110 312"
        stroke="#0f172a"
        strokeOpacity="0.06"
        strokeWidth="1.2"
      />

      {/* Hauptkurve der Wirbelsäule */}
      <path
        d="M90 10 C 150 70, 50 150, 110 220 C 150 270, 100 300, 90 312"
        stroke="url(#spineGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {animate && (
          <animate
            attributeName="stroke-dasharray"
            values="0 600;600 0"
            dur="2.4s"
            fill="freeze"
          />
        )}
      </path>

      {/* Wirbel als feine Querstriche entlang der Kurve */}
      {vertebrae.map((_, i) => {
        const t = i / (vertebrae.length - 1);
        // grobe Approximation der Kurvenpunkte
        const y = 18 + t * 286;
        const x =
          90 +
          42 * Math.sin(t * Math.PI * 1.9) * (1 - t * 0.5);
        const angle = 70 + 30 * Math.cos(t * Math.PI * 1.9);
        const len = 16 - t * 4;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
            <line
              x1={-len}
              y1={0}
              x2={len}
              y2={0}
              stroke="#0f172a"
              strokeOpacity={0.5}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
            <circle cx={0} cy={0} r={2.4} fill="#059669" fillOpacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Content — dichte Inhalts-Slide (Kicker + Headline + optional Lead) ──
function ContentSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "content" }>;
  reducedMotion: boolean;
}) {
  const dark = !!slide.dark;
  const headColor = dark ? "#f8fafc" : COLORS.ink;
  const leadColor = dark ? "#cbd5e1" : COLORS.muted;
  const accent = dark ? "#34d399" : COLORS.accent;
  const appear = reducedMotion
    ? ""
    : "animate-in fade-in slide-in-from-bottom-3 duration-700";
  return (
    <Stage dark={dark}>
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        {slide.kicker && (
          <p
            className={cn("mb-5 text-xs font-medium uppercase tracking-[0.24em] md:text-sm", appear)}
            style={{ color: accent }}
          >
            {slide.kicker}
          </p>
        )}
        <h2
          className={cn("text-display-sm leading-tight md:text-display-md", appear)}
          style={{ ...fontDisplay(600), color: headColor }}
        >
          {slide.headline}
        </h2>
        {slide.lead && (
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg leading-relaxed md:text-xl",
              reducedMotion
                ? ""
                : "animate-in fade-in slide-in-from-bottom-2 duration-700",
            )}
            style={{
              color: leadColor,
              ...(reducedMotion
                ? {}
                : { animationDelay: "160ms", animationFillMode: "both" }),
            }}
          >
            {slide.lead}
          </p>
        )}
      </div>
    </Stage>
  );
}

// ── Term — ein hervorgehobener Kernbegriff mit kleinem Kicker ──
function TermSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "term" }>;
  reducedMotion: boolean;
}) {
  const dark = !!slide.dark;
  return (
    <Stage dark={dark}>
      {slide.kicker && (
        <p
          className="mb-6 text-xs font-medium uppercase tracking-[0.24em] md:text-sm"
          style={{ color: dark ? "#34d399" : COLORS.accent }}
        >
          {slide.kicker}
        </p>
      )}
      <h2
        className={cn(
          "text-display-md md:text-display-lg",
          !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-1000",
        )}
        style={{ ...fontDisplay(600), color: dark ? "#f8fafc" : COLORS.ink }}
      >
        {slide.term}
      </h2>
      <div
        className="mt-8 h-px w-16"
        style={{ backgroundColor: dark ? "#34d399" : COLORS.accent }}
      />
    </Stage>
  );
}

// ── Quote — aufgegriffene Phrase / wörtliches Zitat ──
function QuoteSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "quote" }>;
  reducedMotion: boolean;
}) {
  const dark = !!slide.dark;
  return (
    <Stage dark={dark}>
      <Quote
        className={cn("mb-6 h-8 w-8 md:h-10 md:w-10", !reducedMotion && "animate-in fade-in")}
        style={{ color: dark ? "#34d399" : COLORS.accent, opacity: 0.7 }}
        aria-hidden="true"
      />
      <p
        className={cn(
          "mx-auto max-w-3xl text-display-sm italic leading-tight md:text-display-md",
          !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-700",
        )}
        style={{ ...fontDisplay(500), color: dark ? "#f1f5f9" : COLORS.ink }}
      >
        „{slide.text}"
      </p>
      {slide.caption && (
        <p
          className="mt-8 text-sm uppercase tracking-[0.2em]"
          style={{ color: dark ? "#94a3b8" : COLORS.muted }}
        >
          {slide.caption}
        </p>
      )}
    </Stage>
  );
}

// ── Reveal-List — Headline + gestaffelte Stichpunkte (ohne Icons) ──
function RevealListSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "reveal-list" }>;
  reducedMotion: boolean;
}) {
  const dark = !!slide.dark;
  const accent = dark ? "#34d399" : COLORS.accent;
  return (
    <Stage dark={dark}>
      {slide.kicker && (
        <p
          className="mb-4 text-xs font-medium uppercase tracking-[0.24em] md:text-sm"
          style={{ color: accent }}
        >
          {slide.kicker}
        </p>
      )}
      <h2
        className="mb-10 text-display-sm md:text-display-md"
        style={{ ...fontDisplay(600), color: dark ? "#f8fafc" : COLORS.ink }}
      >
        {slide.title}
      </h2>
      <ul className="flex w-full max-w-xl flex-col gap-4 text-left">
        {slide.items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-4",
              !reducedMotion && "animate-in fade-in slide-in-from-left-3",
            )}
            style={
              reducedMotion
                ? undefined
                : { animationDelay: `${i * 180}ms`, animationFillMode: "both" }
            }
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span
              className="text-xl md:text-2xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                color: dark ? "#e2e8f0" : COLORS.inkSoft,
              }}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </Stage>
  );
}

// ── Module — Modul-Spotlight (Nummer + Titel + Lead + gestaffelte Begriffe) ──
function ModuleSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "module" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
        style={{ color: COLORS.accent }}
      >
        {slide.number}
      </p>
      <h2
        className={cn(
          "text-display-md md:text-display-lg",
          !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-700",
        )}
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.title}
      </h2>
      {slide.lead && (
        <p
          className="mt-5 max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: COLORS.muted }}
        >
          {slide.lead}
        </p>
      )}
      {slide.items.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
          {slide.items.map((item, i) => (
            <span
              key={i}
              className={cn(
                "rounded-full border px-4 py-2 text-sm md:text-base",
                !reducedMotion && "animate-in fade-in zoom-in-95",
              )}
              style={{
                borderColor: COLORS.line,
                backgroundColor: "rgba(5,150,105,0.06)",
                color: COLORS.inkSoft,
                fontFamily: "var(--font-display)",
                ...(reducedMotion
                  ? {}
                  : { animationDelay: `${i * 120}ms`, animationFillMode: "both" }),
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </Stage>
  );
}

// Slide 4 — List (IST)
function ListSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "list" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <h2
        className="mb-12 text-display-sm md:text-display-md"
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.title}
      </h2>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
        {slide.items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center gap-3",
                !reducedMotion && "animate-in fade-in slide-in-from-bottom-2",
              )}
              style={
                reducedMotion
                  ? undefined
                  : { animationDelay: `${i * 120}ms`, animationFillMode: "both" }
              }
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(5,150,105,0.10)" }}
              >
                <Icon className="h-6 w-6" style={{ color: COLORS.accent }} />
              </span>
              <span
                className="text-sm font-medium md:text-base"
                style={{ color: COLORS.inkSoft }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

// Slide 5 — Anti-List (NICHT IST) — dunkler Bruch
function AntiListSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "anti-list" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage dark>
      <h2
        className="mb-12 text-display-sm md:text-display-md"
        style={{ ...fontDisplay(600), color: "#f1f5f9" }}
      >
        {slide.title}
      </h2>
      <div className="flex w-full max-w-xl flex-col gap-5">
        {slide.items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 border-b pb-5 text-left",
              !reducedMotion && "animate-in fade-in slide-in-from-left-2",
            )}
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              ...(reducedMotion
                ? {}
                : { animationDelay: `${i * 140}ms`, animationFillMode: "both" }),
            }}
          >
            <span
              className="text-xl"
              style={{ color: "#f87171", ...fontDisplay(600) }}
              aria-hidden="true"
            >
              ✕
            </span>
            <span
              className="text-lg md:text-xl"
              style={{ color: "#e2e8f0", fontFamily: "var(--font-display)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Stage>
  );
}

// Statement — große Aussage, optional ein hervorgehobenes Wort.
function StatementSlideView({
  slide,
}: {
  slide: Extract<Slide, { type: "statement" }>;
}) {
  return (
    <Stage>
      <p
        className="mx-auto max-w-4xl text-display-sm leading-tight md:text-display-md"
        style={{ ...fontDisplay(500), color: COLORS.ink }}
      >
        {highlightWord(slide.text, slide.emphasis)}
      </p>
    </Stage>
  );
}

/** Hebt ein einzelnes Wort (case-insensitive, ganze Wörter) im Emerald-Akzent hervor. */
function highlightWord(text: string, word?: string): React.ReactNode {
  if (!word) return text;
  const parts = text.split(new RegExp(`(\\b${escapeRegExp(word)}\\b)`, "i"));
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase() ? (
      <span key={i} style={{ color: COLORS.accent }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Echtes Porträt von Max für die Sprecher-Card (statt „MG"-Initialen).
const SPEAKER_PORTRAIT = "/images/masterclass/chronischer-kreuzschmerz/max-portrait.jpg";

// Slide 7 — Speaker
function SpeakerSlideView({
  slide,
}: {
  slide: Extract<Slide, { type: "speaker" }>;
}) {
  const initials = slide.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Stage>
      <div
        className="relative mb-8 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full md:h-48 md:w-48"
        style={{
          background:
            "linear-gradient(145deg, #ece7dd 0%, #f6f2ec 60%, #e6f0eb 100%)",
          boxShadow: "0 10px 40px rgba(15,23,42,0.10)",
        }}
      >
        {SPEAKER_PORTRAIT ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SPEAKER_PORTRAIT}
            alt={slide.name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center top" }}
          />
        ) : (
          <span
            className="text-5xl md:text-6xl"
            style={{ ...fontDisplay(600), color: COLORS.accent, opacity: 0.85 }}
          >
            {initials}
          </span>
        )}
        <div
          className="absolute inset-0 rounded-full ring-1"
          style={{ boxShadow: `inset 0 0 0 1px ${COLORS.line}` }}
        />
      </div>
      <h2
        className="text-display-sm md:text-display-md"
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.name}
      </h2>
      <p
        className="mt-4 max-w-md text-sm leading-relaxed md:text-base"
        style={{ color: COLORS.muted }}
      >
        {slide.title}
      </p>
    </Stage>
  );
}

// Slide 9 — Timeline (Album-Track-Listing)
function TimelineSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "timeline" }>;
  reducedMotion: boolean;
}) {
  // Mitlaufende Übersicht: ALLE Stationen bleiben sichtbar; das Highlight wandert
  // zur aktuell genannten Station. `highlight` (Slide-Ebene) hat Vorrang vor dem
  // Legacy-Feld `station.highlighted`.
  const isActive = (station: { label: string; highlighted?: boolean }) =>
    slide.highlight ? station.label === slide.highlight : !!station.highlighted;

  // Re-Mount der Detail-Liste bei jedem Highlight-Wechsel → Einblend-Animation
  // läuft pro Station erneut (Key = highlight).
  const detailKey = slide.highlight ?? "static";

  return (
    <Stage>
      <div className="flex w-full max-w-xl flex-col items-start gap-7 text-left md:flex-row md:items-center md:gap-12">
        {/* Reise-Linie: alle Stationen durchgehend sichtbar */}
        <div className="relative flex shrink-0 flex-col items-start gap-0 pl-2">
          <div
            className="absolute bottom-3 left-[11px] top-3 w-px"
            style={{ backgroundColor: COLORS.line }}
          />
          {slide.stations.map((station, i) => {
            const active = isActive(station);
            return (
              <div
                key={i}
                className={cn(
                  "relative flex items-center gap-4 py-2.5",
                  !reducedMotion && "animate-in fade-in slide-in-from-left-2",
                )}
                style={
                  reducedMotion
                    ? undefined
                    : { animationDelay: `${i * 70}ms`, animationFillMode: "both" }
                }
              >
                <span
                  className={cn(
                    "relative z-10 flex shrink-0 items-center justify-center rounded-full transition-all duration-500",
                    active ? "h-6 w-6" : "h-3 w-3",
                  )}
                  style={{
                    backgroundColor: active ? COLORS.accent : "#fff",
                    boxShadow: active
                      ? "0 0 0 4px rgba(5,150,105,0.18)"
                      : `inset 0 0 0 1.5px ${COLORS.muted}`,
                  }}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span
                  className={cn(
                    "transition-all duration-500",
                    active ? "text-xl md:text-2xl" : "text-base md:text-lg",
                  )}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: active ? 600 : 400,
                    color: active ? COLORS.ink : COLORS.muted,
                  }}
                >
                  {station.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detail-Panel der aktuell hervorgehobenen Station */}
        {(slide.caption || (slide.detail && slide.detail.length > 0)) && (
          <div
            key={detailKey}
            className={cn(
              "min-w-0 flex-1 border-l pl-6",
              !reducedMotion && "animate-in fade-in slide-in-from-bottom-2 duration-500",
            )}
            style={{ borderColor: COLORS.line }}
          >
            {slide.highlight && (
              <p
                className="text-xs font-semibold uppercase tracking-[0.28em]"
                style={{ color: COLORS.accent }}
              >
                {slide.highlight}
              </p>
            )}
            {slide.caption && (
              <p
                className="mt-1.5 text-2xl md:text-3xl"
                style={{ ...fontDisplay(600), color: COLORS.ink }}
              >
                {slide.caption}
              </p>
            )}
            {slide.detail && slide.detail.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2.5">
                {slide.detail.map((d, i) => (
                  <li
                    key={`${detailKey}-${i}`}
                    className={cn(
                      "flex items-start gap-2.5 text-base md:text-lg",
                      !reducedMotion && "animate-in fade-in slide-in-from-left-1",
                    )}
                    style={{
                      color: COLORS.inkSoft,
                      ...(reducedMotion
                        ? {}
                        : {
                            animationDelay: `${120 + i * 110}ms`,
                            animationFillMode: "both",
                          }),
                    }}
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS.accent }}
                    />
                    <span>{d.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Stage>
  );
}

// Slide 10 — Stats
function StatsSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "stats" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <div className="flex flex-col items-stretch gap-8 md:flex-row md:gap-0">
        {slide.stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-1 flex-col items-center px-8 md:px-12",
              i > 0 && "md:border-l",
              !reducedMotion && "animate-in fade-in zoom-in-95",
            )}
            style={{
              borderColor: COLORS.line,
              ...(reducedMotion
                ? {}
                : { animationDelay: `${i * 160}ms`, animationFillMode: "both" }),
            }}
          >
            <span
              className="text-display-md md:text-display-lg"
              style={{ ...fontDisplay(600), color: COLORS.ink }}
            >
              {stat.value}
            </span>
            <span
              className="mt-2 text-sm uppercase tracking-[0.18em]"
              style={{ color: COLORS.muted }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </Stage>
  );
}

// Slide 11 — Checklist (Häkchen erscheinen nacheinander)
function ChecklistSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "checklist" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <div className="flex w-full max-w-md flex-col gap-6">
        {slide.items.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-5 rounded-2xl border bg-white/60 px-6 py-5 text-left",
                !reducedMotion && "animate-in fade-in slide-in-from-bottom-2",
              )}
              style={{
                borderColor: COLORS.line,
                ...(reducedMotion
                  ? {}
                  : {
                      animationDelay: `${i * 450}ms`,
                      animationFillMode: "both",
                    }),
              }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(5,150,105,0.10)" }}
              >
                <Icon className="h-5 w-5" style={{ color: COLORS.accent }} />
              </span>
              <span
                className="flex-1 text-lg"
                style={{ color: COLORS.inkSoft, fontFamily: "var(--font-display)" }}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                  !reducedMotion && "animate-in zoom-in-50",
                )}
                style={{
                  backgroundColor: COLORS.accent,
                  ...(reducedMotion
                    ? {}
                    : {
                        animationDelay: `${i * 450 + 250}ms`,
                        animationFillMode: "both",
                      }),
                }}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

// Slide 13 — Outro
function OutroSlideView({
  slide,
  reducedMotion,
}: {
  slide: Extract<Slide, { type: "outro" }>;
  reducedMotion: boolean;
}) {
  return (
    <Stage>
      <p
        className="mb-5 text-xs uppercase tracking-[0.24em]"
        style={{ color: COLORS.accent }}
      >
        Als Nächstes · {slide.nextLabel}
      </p>
      <h2
        className="mx-auto max-w-3xl text-display-sm leading-tight md:text-display-md"
        style={{ ...fontDisplay(600), color: COLORS.ink }}
      >
        {slide.nextTitle}
      </h2>
      <div
        className={cn(
          "mt-12 inline-flex items-center gap-2 text-base",
          !reducedMotion && "animate-pulse",
        )}
        style={{ color: COLORS.muted }}
      >
        <span style={{ fontFamily: "var(--font-display)" }}>{slide.hint}</span>
      </div>
    </Stage>
  );
}

// ── Hook: prefers-reduced-motion ─────────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
