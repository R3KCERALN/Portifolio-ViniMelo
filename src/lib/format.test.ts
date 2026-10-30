import { describe, expect, it } from 'vitest';
import { formatBRL } from './format';

describe('formatBRL', () => {
  it('omits cents for whole values', () => {
    expect(formatBRL(40)).toBe('R$ 40');
    expect(formatBRL(128)).toBe('R$ 128');
  });

  it('keeps cents when present', () => {
    expect(formatBRL(32.5)).toBe('R$ 32,50');
  });
});
