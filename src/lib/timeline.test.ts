import { describe, expect, it } from 'vitest';
import { computeClips, progressToTimecode, scrollProgress } from './timeline';

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
