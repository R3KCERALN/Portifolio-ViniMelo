import { describe, expect, it } from 'vitest';
import { whatsappUrl } from './whatsapp';

describe('whatsappUrl', () => {
  it('returns the bare link without a message', () => {
    expect(whatsappUrl()).toBe('https://wa.me/5591987491993');
  });

  it('encodes the message', () => {
    expect(whatsappUrl('Oi, Vinicius! Tenho interesse no Pacote VIP.')).toBe(
      'https://wa.me/5591987491993?text=Oi%2C%20Vinicius!%20Tenho%20interesse%20no%20Pacote%20VIP.',
    );
  });
});
