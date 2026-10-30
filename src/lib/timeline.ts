export const TIMELINE_TOTAL_SECONDS = 60; // a página inteira "dura" 1 minuto, como um Reels
export const TIMELINE_FPS = 30;

export interface ClipBox {
  id: string;
  left: number;
  width: number;
}

export function scrollProgress(scrollY: number, viewportHeight: number, docHeight: number): number {
  if (docHeight <= 0) return 0;
  // A âncora sai do meio da tela, no topo da página, e desce até a base da tela no fim,
  // para a agulha chegar a 1 quando a rolagem acaba.
  const maxScroll = Math.max(0, docHeight - viewportHeight);
  const t = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  return Math.min(1, Math.max(0, (scrollY + viewportHeight * (0.5 + 0.5 * t)) / docHeight));
}

export function progressToTimecode(
  progress: number,
  totalSeconds = TIMELINE_TOTAL_SECONDS,
  fps = TIMELINE_FPS,
): string {
  const clamped = Math.min(1, Math.max(0, progress));
  const frames = Math.floor(clamped * totalSeconds * fps);
  const pad = (n: number) => String(n).padStart(2, '0');
  const ff = frames % fps;
  const totalSecs = Math.floor(frames / fps);
  return [Math.floor(totalSecs / 3600), Math.floor(totalSecs / 60) % 60, totalSecs % 60, ff].map(pad).join(':');
}

export function computeClips(sections: { id: string; top: number; height: number }[], docHeight: number): ClipBox[] {
  if (docHeight <= 0) return [];
  return sections.map(({ id, top, height }) => ({
    id,
    left: (top / docHeight) * 100,
    width: (height / docHeight) * 100,
  }));
}
