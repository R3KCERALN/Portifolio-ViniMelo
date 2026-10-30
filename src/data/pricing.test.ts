import { describe, expect, it } from 'vitest';
import { packDiscountPercent, packFullPrice, packPricePerVideo, packs, tiers } from './pricing';

const premium = packs.find((p) => p.id === 'premium')!;
const vip = packs.find((p) => p.id === 'vip')!;

describe('pricing', () => {
  it('computes the Premium package numbers', () => {
    expect(packFullPrice(premium)).toBe(160);
    expect(packDiscountPercent(premium)).toBe(20);
    expect(packPricePerVideo(premium)).toBe(32);
    expect(premium.validityDays).toBe(15);
  });

  it('computes the VIP package numbers', () => {
    expect(packFullPrice(vip)).toBe(400);
    expect(packDiscountPercent(vip)).toBe(30);
    expect(vip.validityDays).toBe(30);
  });

  it('leaves Complexo and Outros formatos without a fixed price', () => {
    expect(tiers.find((t) => t.id === 'complexo')!.price).toBeNull();
    expect(tiers.find((t) => t.id === 'outros')!.price).toBeNull();
  });

  it('highlights only the VIP package', () => {
    expect(packs.filter((p) => p.highlighted).map((p) => p.id)).toEqual(['vip']);
  });

  it('writes the WhatsApp messages from the spec', () => {
    expect(vip.whatsappMessage).toBe('Oi, Vinicius! Tenho interesse no Pacote VIP.');
    expect(tiers.find((t) => t.id === 'basico')!.whatsappMessage).toBe('Oi, Vinicius! Tenho interesse em um vídeo Básico.');
  });
});
