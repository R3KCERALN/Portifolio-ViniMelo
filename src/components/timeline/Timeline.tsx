import { useMemo } from 'react';
import { progressToTimecode, TIMELINE_TOTAL_SECONDS } from '@/lib/timeline';
import { useScrollProgress } from './useScrollProgress';

export interface TimelineClip {
  id: string;
  label: string;
  track: 'V1' | 'V2';
  color: string;
}

const LABEL_W = 96; // px, coluna dos rótulos V2/V1/A1 e do timecode (a partir de md)
const RULER_MARKS = [0, 15, 30, 45, 60];

function goTo(id: string, track: 'V1' | 'V2') {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: track === 'V2' ? 'center' : 'start' });
}

// Forma de onda decorativa: alturas fixas, sem aleatoriedade, para o HTML não mudar entre builds.
const WAVE = Array.from({ length: 160 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 1.13) * 0.35 + Math.sin(i * 0.071) * 0.1);
  return Math.max(0.12, Math.min(1, v));
});

function Waveform() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 160 20" preserveAspectRatio="none" aria-hidden="true">
      {WAVE.map((h, i) => (
        <rect key={i} x={i + 0.2} y={10 - h * 9} width={0.6} height={h * 18} fill="#9be0bd" opacity={0.75} />
      ))}
    </svg>
  );
}

function Lane({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative flex-1 bg-[#232323] ${className}`}>{children}</div>;
}

function TrackRow({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-0 flex-1 border-b border-[#111] ${className}`}>
      <div
        className="hidden shrink-0 items-center justify-center border-r border-[#111] bg-[#262626] text-[10px] text-[#9a9a9a] md:flex"
        style={{ width: LABEL_W }}
        aria-hidden="true"
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function Timeline({ clips }: { clips: TimelineClip[] }) {
  const ids = useMemo(() => clips.map((c) => c.id), [clips]);
  const { progress, clips: boxes } = useScrollProgress(ids);
  const boxById = new Map(boxes.map((b) => [b.id, b]));

  const renderClips = (track: 'V1' | 'V2') =>
    clips
      .filter((c) => c.track === track && boxById.has(c.id))
      .map((c) => {
        const box = boxById.get(c.id)!;
        const left = box.left;
        const active = progress * 100 >= left && progress * 100 < left + box.width;
        return (
          <button
            key={c.id}
            type="button"
            aria-label={`Ir para ${c.label}`}
            aria-current={active ? 'location' : undefined}
            onClick={() => goTo(c.id, track)}
            className={`absolute inset-y-[2px] overflow-hidden rounded-[2px] px-1 text-left text-[10px] leading-none whitespace-nowrap text-[#111] transition-[filter] hover:brightness-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white ${active ? 'ring-1 ring-white/80' : ''}`}
            style={{ left: `${left}%`, width: `${box.width}%`, minWidth: 4, background: c.color }}
          >
            <span className="hidden md:inline" aria-hidden="true">
              {c.label}
            </span>
          </button>
        );
      });

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col bg-[#1d1d1d] pb-[env(safe-area-inset-bottom)] text-[#cfcfcf] shadow-[0_-1px_0_#111]"
      style={{ height: 'calc(var(--timeline-h) + env(safe-area-inset-bottom, 0px))' }}
      role="navigation"
      aria-label="Linha do tempo da página"
    >
      {/* régua + timecode (só a partir de md) */}
      <div className="hidden h-[22px] shrink-0 border-b border-[#111] bg-[#262626] md:flex" aria-hidden="true">
        <div
          className="flex shrink-0 items-center justify-center text-[11px] font-semibold tracking-wide text-[#4da3ff] tabular-nums"
          style={{ width: LABEL_W }}
        >
          {progressToTimecode(progress)}
        </div>
        <div className="relative flex-1">
          {RULER_MARKS.map((s) => (
            <span
              key={s}
              className="absolute top-0 h-full border-l border-[#4a4a4a] pl-1 text-[9px] leading-[22px] text-[#9a9a9a]"
              style={{ left: `${(s / TIMELINE_TOTAL_SECONDS) * 100}%`, transform: s === TIMELINE_TOTAL_SECONDS ? 'translateX(-100%)' : undefined }}
            >
              {`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`}
            </span>
          ))}
        </div>
      </div>

      <TrackRow label="V2" className="md:flex-[0.9]">
        <Lane className="mr-0">{renderClips('V2')}</Lane>
      </TrackRow>
      <TrackRow label="V1" className="flex-[1.6] md:flex-1">
        <Lane>{renderClips('V1')}</Lane>
      </TrackRow>
      <TrackRow label="A1" className="hidden border-b-0 md:flex">
        <Lane>
          <div className="absolute inset-y-[2px] inset-x-[1%] overflow-hidden rounded-[2px] bg-[#3f8f6b]" aria-hidden="true">
            <Waveform />
          </div>
        </Lane>
      </TrackRow>

      {/* agulha */}
      <div className="pointer-events-none absolute inset-y-0 right-0 left-0 md:left-[96px]" aria-hidden="true">
        <div className="relative size-full">
          <div
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[#4da3ff]"
            style={{ left: `${progress * 100}%` }}
          >
            <div
              className="absolute -top-px left-1/2 h-2.5 w-3 -translate-x-1/2 bg-[#4da3ff]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
