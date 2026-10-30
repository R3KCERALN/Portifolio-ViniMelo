import { describe, expect, it } from 'vitest';
import { clients, people } from './clients';

describe('clients', () => {
  it('lists the 14 companies with unique names', () => {
    expect(clients).toHaveLength(14);
    expect(new Set(clients.map((c) => c.name)).size).toBe(14);
  });

  it('crops only Fazz into a circle', () => {
    expect(clients.filter((c) => c.treatment === 'circle').map((c) => c.name)).toEqual(['Fazz']);
  });

  it('brightens only the two dark logos', () => {
    expect(clients.filter((c) => c.treatment === 'brighten').map((c) => c.name)).toEqual([
      'Yêda Carvalho',
      'Clínica Pró-Cardíaco',
    ]);
  });

  it('starts without people', () => {
    expect(people).toEqual([]);
  });
});
