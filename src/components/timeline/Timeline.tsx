import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  progressToScrollY,
  progressToTimecode,
  subdivideClip,
  TIMELINE_TOTAL_SECONDS,
} from '@/lib/timeline';
import { useScrollProgress } from './useScrollProgress';

const LABEL_W = 130; // px, coluna dos rótulos V2/V1/A1 e do timecode (a partir de md)
const RULER_MARKS = [0, 15, 30, 45, 60];
const PLAY_JUMP_MS = 4000; // com reduced motion o play salta de seção em seção a cada 4 s

// Clipes da trilha V1, na ordem da página. `id` é o id da seção; a cor é o token da seção.
const SECTIONS = [
  { id: 'abertura', label: 'Abertura', color: 'var(--lilac)' },
  { id: 'portfolio', label: 'Portfólio', color: 'var(--blue)' },
  { id: 'processo', label: 'Processo', color: 'var(--green)' },
  { id: 'contrate', label: 'Contrate', color: 'var(--pink)' },
  { id: 'trabalhou-com', label: 'Clientes', color: 'var(--yellow)' },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n: number) => String(n).padStart(2, '0');
const format = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

// Forma de onda decorativa: alturas fixas e arredondadas, para o HTML do servidor e o do navegador serem idênticos.
const WAVE = Array.from({ length: 160 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 1.13) * 0.35 + Math.sin(i * 0.071) * 0.1);
  const h = Math.max(0.12, Math.min(1, v));
  return { y: Number((10 - h * 9).toFixed(3)), height: Number((h * 18).toFixed(3)) };
});

function Waveform() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 160 20" preserveAspectRatio="none" aria-hidden="true">
      {WAVE.map((bar, i) => (
        <rect key={i} x={i + 0.2} y={bar.y} width={0.6} height={bar.height} fill="#8bca9e" />
      ))}
    </svg>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function jumpToProgress(progress: number) {
  const top = progressToScrollY(progress, window.innerHeight, document.documentElement.scrollHeight);
  window.scrollTo({ top, behavior: 'instant' });
}

function PlayButton({ playing, onToggle, className = '' }: { playing: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      data-play
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pausar' : 'Reproduzir a página'}
      className={`flex size-11 items-center justify-center text-cream hover:text-white ${className}`}
    >
      {playing ? <Pause size={22} fill="currentColor" aria-hidden="true" /> : <Play size={22} fill="currentColor" aria-hidden="true" />}
    </button>
  );
}

export default function Timeline({ videoCount }: { videoCount: number }) {
  const { progress, clips: boxes } = useScrollProgress(SECTION_IDS);
  // O primeiro clipe começa no 00:00 (o menu fixo ocupa o topo da página) e o último vai até o fim (rodapé).
  const boxById = useMemo(() => {
    const map = new Map(boxes.map((b) => [b.id, { ...b }]));
    const first = map.get(SECTION_IDS[0]);
    if (first) (first.width += first.left), (first.left = 0);
    const last = map.get(SECTION_IDS[SECTION_IDS.length - 1]);
    if (last) last.width = 100 - last.left;
    return map;
  }, [boxes]);
  const v2Boxes = useMemo(() => {
    const parent = boxById.get('portfolio');
    return parent ? subdivideClip(parent, videoCount) : [];
  }, [boxById, videoCount]);

  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const laneRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const timecode = progressToTimecode(progress);
  const seconds = Math.round(progress * TIMELINE_TOTAL_SECONDS);

  // O timecode da timeline vale para todo `[data-timecode]` da página (ex.: o da foto da abertura).
  useEffect(() => {
    document.querySelectorAll('[data-timecode]').forEach((el) => (el.textContent = timecode));
  }, [timecode]);

  const stop = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
  }, []);

  // Play: a página rola em tempo real (1 s da timeline por segundo). Pausa em qualquer gesto do usuário.
  useEffect(() => {
    if (!playing) return;
    const abort = (e: Event) => {
      // O Enter/Espaço no próprio botão de play é tratado pelo clique.
      if (e.type === 'keydown' && (e.target as HTMLElement).closest?.('[data-play]')) return;
      stop();
    };
    const events = ['wheel', 'touchstart', 'keydown'] as const;
    events.forEach((name) => window.addEventListener(name, abort, { passive: true }));

    let frame = 0;
    let timer = 0;
    if (reducedMotion()) {
      // Sem rolagem suave: pula de seção em seção, sem animação.
      const next = () => {
        const y = window.scrollY + 4;
        const target = SECTION_IDS.map((id) => document.getElementById(id)).find(
          (el) => el && el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop || '0') > y,
        );
        if (!target) return stop();
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      };
      timer = window.setInterval(next, PLAY_JUMP_MS);
    } else {
      const startProgress = progressRef.current >= 0.999 ? 0 : progressRef.current;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = startProgress + (now - t0) / (TIMELINE_TOTAL_SECONDS * 1000);
        jumpToProgress(Math.min(1, p));
        if (p >= 1) return stop();
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      events.forEach((name) => window.removeEventListener(name, abort));
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [playing, stop]);

  const togglePlay = () => {
    playingRef.current = !playingRef.current;
    setPlaying(playingRef.current);
  };

  const progressAt = (clientX: number) => {
    const rect = laneRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  // Arrastar: o clique em área livre da régua ou das trilhas (fora de um clipe) leva a página até aquele ponto.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.clientX < laneRef.current!.getBoundingClientRect().left) return;
    stop();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    jumpToProgress(progressAt(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) jumpToProgress(progressAt(e.clientX));
  };
  const endDrag = () => {
    dragging.current = false;
  };

  const onSliderKey = (e: React.KeyboardEvent) => {
    const second = 1 / TIMELINE_TOTAL_SECONDS;
    const steps: Record<string, number> = { ArrowRight: second, ArrowUp: second, ArrowLeft: -second, ArrowDown: -second, PageUp: 5 * second, PageDown: -5 * second };
    let next: number | null = null;
    if (e.key in steps) next = progressRef.current + steps[e.key];
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 1;
    if (next === null) return;
    e.preventDefault();
    stop();
    jumpToProgress(Math.min(1, Math.max(0, next)));
  };

  const goToVideo = (n: number) => {
    stop();
    scrollToSection('portfolio');
    window.dispatchEvent(new CustomEvent('portfolio:show', { detail: n }));
  };

  const isActive = (box: { left: number; width: number }) => progress * 100 >= box.left && progress * 100 < box.left + box.width;

  const clipClass =
    'absolute inset-y-[3px] overflow-hidden rounded-[3px] px-2 text-left text-[13px] leading-none font-bold whitespace-nowrap text-background transition-[filter] hover:brightness-110 focus-visible:z-10 md:px-3 md:text-sm';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col border-t border-rule-strong bg-panel pb-[env(safe-area-inset-bottom)] text-dim"
      style={{ height: 'calc(var(--timeline-h) + env(safe-area-inset-bottom, 0px))' }}
      role="navigation"
      aria-label="Linha do tempo da página"
    >
      {/* linha de controle (desktop) */}
      <div className="relative hidden h-11 shrink-0 items-center justify-center border-b border-rule md:flex">
        <PlayButton playing={playing} onToggle={togglePlay} />
        <span className="mono absolute right-[5%] text-[13px] tracking-[0.18em] text-dim uppercase" aria-hidden="true">
          Arraste para explorar
        </span>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-none flex-col md:cursor-ew-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* régua (desktop) */}
        <div className="hidden h-8 shrink-0 border-b border-rule md:flex" aria-hidden="true">
          <div className="mono flex shrink-0 items-center justify-center text-[14px] font-medium text-[#88c4f2]" style={{ width: LABEL_W }}>
            {timecode}
          </div>
          <div className="relative flex-1">
            {RULER_MARKS.map((s, i) => (
              <span
                key={s}
                className="mono absolute top-0 h-full border-l border-rule-strong pl-1.5 text-[11px] leading-8 text-dim"
                style={{ left: `${(s / TIMELINE_TOTAL_SECONDS) * 100}%`, ...(i === RULER_MARKS.length - 1 ? { transform: 'translateX(-100%)', borderLeft: 0, borderRight: '1px solid var(--rule-strong)', paddingRight: 6, paddingLeft: 0 } : {}) }}
              >
                {format(s)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* play no celular */}
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-rule md:hidden">
            <PlayButton playing={playing} onToggle={togglePlay} className="!size-10" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            {/* V2 */}
            <div className="flex min-h-0 flex-[0.85] border-b border-rule md:flex-1">
              <div className="hidden shrink-0 items-center justify-center border-r border-rule text-[15px] md:flex" style={{ width: LABEL_W }} aria-hidden="true">
                V2
              </div>
              <div className="relative flex-1">
                {v2Boxes.map((box, i) => (
                  <button
                    key={box.id}
                    type="button"
                    aria-label={`Ir para o vídeo ${pad(i + 1)}`}
                    aria-current={isActive(box) ? 'location' : undefined}
                    onClick={() => goToVideo(i + 1)}
                    className={`${clipClass} !px-1 text-center !text-[11px] md:!text-xs`}
                    style={{ left: `${box.left}%`, width: `${box.width}%`, background: 'var(--blue)', minWidth: 3 }}
                  >
                    <span className="hidden md:inline" aria-hidden="true">{pad(i + 1)}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* V1 */}
            <div className="flex min-h-0 flex-[1.15] border-b border-rule md:flex-1">
              <div className="hidden shrink-0 items-center justify-center border-r border-rule text-[15px] md:flex" style={{ width: LABEL_W }} aria-hidden="true">
                V1
              </div>
              <div className="relative flex-1">
                {SECTIONS.flatMap((section) => {
                  const box = boxById.get(section.id);
                  if (!box) return [];
                  return [
                    <button
                      key={section.id}
                      type="button"
                      aria-label={`Ir para ${section.label}`}
                      aria-current={isActive(box) ? 'location' : undefined}
                      onClick={() => {
                        stop();
                        scrollToSection(section.id);
                      }}
                      className={clipClass}
                      style={{ left: `${box.left}%`, width: `${box.width}%`, background: section.color, minWidth: 4 }}
                    >
                      <span className="hidden md:inline" aria-hidden="true">{section.label}</span>
                    </button>,
                  ];
                })}
              </div>
            </div>
            {/* A1 (desktop) */}
            <div className="hidden min-h-0 flex-1 md:flex">
              <div className="flex shrink-0 items-center justify-center border-r border-rule text-[15px]" style={{ width: LABEL_W }} aria-hidden="true">
                A1
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-x-[1%] inset-y-[3px] overflow-hidden rounded-[3px] bg-[#579069]" aria-hidden="true">
                  <Waveform />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* agulha: a área de posição acompanha a das trilhas (mesma coluna de rótulos) */}
        <div ref={laneRef} className="pointer-events-none absolute inset-y-0 right-0 left-12 md:left-[130px]">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Posição na página"
            aria-valuemin={0}
            aria-valuemax={TIMELINE_TOTAL_SECONDS}
            aria-valuenow={seconds}
            aria-valuetext={timecode}
            onKeyDown={onSliderKey}
            className="pointer-events-auto absolute inset-y-0 w-6 -translate-x-1/2 cursor-ew-resize outline-offset-[-2px] focus-visible:outline-2"
            style={{ left: `${progress * 100}%` }}
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#68a3e7]" />
            <div
              className="absolute -top-px left-1/2 hidden h-3 w-3.5 -translate-x-1/2 bg-[#68a3e7] md:block"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
