import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CATEGORY_ORDER, categoryLabel, categoryTabLabel, type VideoCategory } from '@/lib/videoName';

export interface CarouselVideo {
  /** Posição original na pasta, de 1 a N; vira o id `video-N` e o número do card. */
  n: number;
  title: string;
  category: VideoCategory | null;
  detail: string | null;
  embedUrl: string;
  poster: string | null;
  aspectRatio: number;
}

type Filter = 'all' | VideoCategory;

const pad = (n: number) => String(n).padStart(2, '0');
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PortfolioCarousel({ videos }: { videos: CarouselVideo[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [range, setRange] = useState<[number, number]>([1, 1]);
  const trackRef = useRef<HTMLUListElement>(null);
  const pendingShow = useRef<number | null>(null);

  const tabs = useMemo(() => {
    const present = CATEGORY_ORDER.filter((c) => videos.some((v) => v.category === c));
    return present.length ? present : [];
  }, [videos]);

  const shown = useMemo(() => (filter === 'all' ? videos : videos.filter((v) => v.category === filter)), [videos, filter]);

  const cards = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    const visible = cards().flatMap((card, i) => {
      const r = card.getBoundingClientRect();
      const overlap = Math.min(r.right, box.right) - Math.max(r.left, box.left);
      return overlap >= r.width * 0.6 ? [i + 1] : [];
    });
    if (visible.length) setRange([visible[0], visible[visible.length - 1]]);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      track.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, shown]);

  const scrollTrackTo = (left: number) =>
    trackRef.current?.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const lefts = cards().map((c) => c.offsetLeft - cards()[0].offsetLeft);
    const x = track.scrollLeft;
    const target = dir === 1 ? lefts.find((l) => l > x + 2) : [...lefts].reverse().find((l) => l < x - 2);
    scrollTrackTo(target ?? (dir === 1 ? track.scrollWidth : 0));
  };

  // A trilha V2 da timeline pede o card N: mostra todos (se o filtro escondê-lo) e leva o carrossel até ele.
  const showCard = useCallback((n: number) => {
    const el = document.getElementById(`video-${n}`);
    const track = trackRef.current;
    if (!el || !track) return false;
    track.scrollTo({ left: el.offsetLeft - cards()[0].offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    return true;
  }, []);

  useEffect(() => {
    const onShow = (e: Event) => {
      const n = (e as CustomEvent<number>).detail;
      if (!showCard(n)) {
        pendingShow.current = n;
        setFilter('all');
      }
    };
    window.addEventListener('portfolio:show', onShow);
    return () => window.removeEventListener('portfolio:show', onShow);
  }, [showCard]);

  useEffect(() => {
    if (pendingShow.current !== null) {
      showCard(pendingShow.current);
      pendingShow.current = null;
    } else {
      trackRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [filter, showCard]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), step(1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), step(-1));
  };

  return (
    <div>
      {tabs.length > 0 && (
        <div role="tablist" aria-label="Categorias" className="mt-8 flex flex-wrap gap-x-2 border-y border-rule md:gap-x-6">
          {(['all', ...tabs] as Filter[]).map((id) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(id)}
                className={`px-3 py-3.5 text-[1.0625rem] transition-colors ${active ? 'font-medium text-blue shadow-[inset_0_-2px_0_var(--blue)]' : 'text-body hover:text-cream'}`}
              >
                {id === 'all' ? 'Todos' : categoryTabLabel(id)}
              </button>
            );
          })}
        </div>
      )}

      <ul
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Vídeos do portfólio"
        onKeyDown={onKeyDown}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 [--media-h:26.25rem] [scrollbar-width:none] md:gap-8 md:[--media-h:22.5rem] [&::-webkit-scrollbar]:hidden"
      >
        {shown.map((video) => (
          <li
            key={video.n}
            id={`video-${video.n}`}
            className="shrink-0 snap-start scroll-mt-24"
            style={{ width: `max(20rem, calc(var(--media-h) * ${video.aspectRatio.toFixed(4)}))` }}
          >
            {/* O player do Drive monta a página dele com pelo menos ~320 px de largura. Num iframe mais estreito ele passa do quadro e o play, que fica no centro dessa página, aparece deslocado e fora do clique. Por isso a caixa nunca é mais estreita que 20rem; o vídeo vertical fica com faixas pretas dos dois lados. */}
            <div
              className="relative overflow-hidden bg-black"
              style={{ height: 'var(--media-h)', width: `max(20rem, calc(var(--media-h) * ${video.aspectRatio.toFixed(4)}))`, maxWidth: '100%' }}
            >
              {video.poster && <img src={video.poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
              {/* O Drive só toca vídeo no player dele. A capa fica por baixo enquanto o player carrega; ele só carrega perto da tela. */}
              <iframe
                src={video.embedUrl}
                title={video.title}
                loading="lazy"
                allow="autoplay; fullscreen"
                className="absolute inset-0 size-full border-0"
              />
              <span className="mono pointer-events-none absolute top-3 left-4 text-[1.0625rem] tracking-[0.08em] text-cream [text-shadow:0_1px_6px_rgb(0_0_0/0.7)]">
                {pad(video.n)}
              </span>
            </div>
            <h3 title={video.title} className="mt-4 line-clamp-3 text-[1.5rem] leading-tight font-bold text-cream md:text-[1.75rem]">{video.title}</h3>
            {video.category && (
              <p className="mt-1 text-[1.0625rem] text-dim">
                {categoryLabel(video.category)}
                {video.detail && ` · ${video.detail}`}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-end gap-4">
        <button type="button" onClick={() => step(-1)} aria-label="Vídeos anteriores" className="btn !size-10 !min-h-0 !p-0">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <p className="mono text-[0.9375rem] tracking-[0.08em] text-body" aria-live="polite">
          {pad(range[0])} — {pad(range[1])} / {pad(shown.length)}
        </p>
        <button type="button" onClick={() => step(1)} aria-label="Próximos vídeos" className="btn !size-10 !min-h-0 !p-0">
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
