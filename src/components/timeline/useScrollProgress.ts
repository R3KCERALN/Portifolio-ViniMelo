import { useEffect, useState } from 'react';
import { computeClips, scrollProgress, type ClipBox } from '@/lib/timeline';

/**
 * Posição da agulha (0–1) e caixa de cada clipe, medidas a partir dos elementos da página
 * com os `ids` dados. Ids sem elemento na página são ignorados.
 */
export function useScrollProgress(ids: string[]): { progress: number; clips: ClipBox[] } {
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<ClipBox[]>([]);
  const key = ids.join('|');

  useEffect(() => {
    const idList = key ? key.split('|') : [];
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      setProgress(scrollProgress(window.scrollY, window.innerHeight, document.documentElement.scrollHeight));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };

    const measure = () => {
      const sections = idList.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        return [{ id, top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight }];
      });
      setClips(computeClips(sections, document.documentElement.scrollHeight));
      updateProgress();
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return { progress, clips };
}
