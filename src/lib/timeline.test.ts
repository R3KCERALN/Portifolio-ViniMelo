import { describe, expect, it } from 'vitest';
import { computeClips, progressToScrollY, progressToTimecode, scrollProgress, subdivideClip } from './timeline';

describe('progressToTimecode', () => {
  it('maps progress to HH:MM:SS:FF', () => {
    expect(progressToTimecode(0)).toBe('00:00:00:00');
    expect(progressToTimecode(0.5)).toBe('00:00:30:00');
    expect(progressToTimecode(1)).toBe('00:01:00:00');
    expect(progressToTimecode(0.1234)).toBe('00:00:07:12');
  });

  it('clamps out-of-range progress', () => {
    expect(progressToTimecode(-1)).toBe('00:00:00:00');
    expect(progressToTimecode(2)).toBe('00:01:00:00');
  });
});

describe('scrollProgress', () => {
  it('measures the viewport midpoint against the document', () => {
    expect(scrollProgress(0, 800, 8000)).toBeCloseTo(0.05);
  });

  it('clamps at the end and handles an empty document', () => {
    expect(scrollProgress(7200, 800, 8000)).toBe(1);
    expect(scrollProgress(0, 800, 0)).toBe(0);
  });
});

describe('computeClips', () => {
  it('converts section boxes to percentages of the document', () => {
    expect(
      computeClips([{ id: 'abertura', top: 0, height: 1000 }, { id: 'portfolio', top: 1000, height: 3000 }], 4000),
    ).toEqual([{ id: 'abertura', left: 0, width: 25 }, { id: 'portfolio', left: 25, width: 75 }]);
  });

  it('returns nothing for no sections', () => {
    expect(computeClips([], 4000)).toEqual([]);
  });
});

describe('progressToScrollY', () => {
  it('is the inverse of scrollProgress', () => {
    for (const p of [0.1, 0.5, 0.9]) {
      expect(scrollProgress(progressToScrollY(p, 800, 8000), 800, 8000)).toBeCloseTo(p, 6);
    }
  });

  it('maps the ends of the timeline to the ends of the page', () => {
    expect(progressToScrollY(0, 800, 8000)).toBe(0);
    expect(progressToScrollY(1, 800, 8000)).toBe(7200);
  });

  it('clamps and handles a page that fits the screen', () => {
    expect(progressToScrollY(-1, 800, 8000)).toBe(0);
    expect(progressToScrollY(2, 800, 8000)).toBe(7200);
    expect(progressToScrollY(0.5, 800, 600)).toBe(0);
  });
});

describe('subdivideClip', () => {
  const parent = { id: 'portfolio', left: 10, width: 50 };

  it('returns nothing for zero clips', () => {
    expect(subdivideClip(parent, 0)).toEqual([]);
  });

  it('splits the parent into equal boxes with a gap between them', () => {
    const boxes = subdivideClip(parent, 10);
    expect(boxes.map((b) => b.id)).toEqual(Array.from({ length: 10 }, (_, i) => `video-${i + 1}`));
    expect(boxes[0].left).toBe(parent.left);
    const sum = boxes.reduce((acc, b) => acc + b.width, 0) + 9 * 0.15;
    expect(sum).toBeCloseTo(parent.width, 6);
    expect(boxes[1].left).toBeCloseTo(boxes[0].left + boxes[0].width + 0.15, 6);
    expect(boxes[9].left + boxes[9].width).toBeCloseTo(parent.left + parent.width, 6);
  });

  it('gives a single clip the whole parent', () => {
    expect(subdivideClip(parent, 1)).toEqual([{ id: 'video-1', left: 10, width: 50 }]);
  });
});
