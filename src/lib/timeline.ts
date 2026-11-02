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

/** Inverso de `scrollProgress`: a rolagem (px) em que a agulha fica em `progress`. */
export function progressToScrollY(progress: number, viewportHeight: number, docHeight: number): number {
  const maxScroll = Math.max(0, docHeight - viewportHeight);
  if (maxScroll === 0) return 0;
  const p = Math.min(1, Math.max(0, progress));
  const y = (p * docHeight - 0.5 * viewportHeight) / (1 + (0.5 * viewportHeight) / maxScroll);
  return Math.min(maxScroll, Math.max(0, y));
}

/** Divide o clipe pai em `count` caixas iguais, com folga entre elas, de ids `video-1…N`. */
export function subdivideClip(parent: ClipBox, count: number, gapPercent = 0.15): ClipBox[] {
  if (count <= 0) return [];
  // As folgas nunca passam de 20% do clipe pai, para as caixas não sumirem em telas estreitas.
  const gap = Math.min(gapPercent, (parent.width * 0.2) / Math.max(1, count - 1));
  const width = (parent.width - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) => ({
    id: `video-${i + 1}`,
    left: parent.left + i * (width + gap),
    width,
  }));
}
