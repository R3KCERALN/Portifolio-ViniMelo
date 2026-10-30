export interface Tier {
  id: 'basico' | 'intermediario' | 'complexo' | 'outros';
  name: string;
  description: string;
  price: number | null;
  priceNote?: string;
  whatsappMessage: string;
}

export interface Pack {
  id: 'premium' | 'vip';
  name: string;
  items: { tierId: 'basico' | 'intermediario'; quantity: number }[];
  price: number;
  validityDays: number;
  highlighted: boolean;
  whatsappMessage: string;
}

const message = (target: string) => `Oi, Vinicius! Tenho interesse ${target}.`;

export const tiers: Tier[] = [
  {
    id: 'basico',
    name: 'Básico',
    description: 'Reels/TikTok de até 1 min, edição única',
    price: 40,
    whatsappMessage: message('em um vídeo Básico'),
  },
  {
    id: 'intermediario',
    name: 'Intermediário',
    description: 'Reels/TikTok de até 1 min com mais efeitos e pós-processamento',
    price: 60,
    whatsappMessage: message('em um vídeo Intermediário'),
  },
  {
    id: 'complexo',
    name: 'Complexo',
    description: 'Reels/TikTok com edição, efeitos e pós-processamento mais pesados; after movies (sem limite de 1 min)',
    price: null,
    priceNote: 'Negociado conforme a ideia do vídeo',
    whatsappMessage: message('em um vídeo Complexo'),
  },
  {
    id: 'outros',
    name: 'Outros formatos',
    description: 'Shorts, vídeo longo para YouTube, criativo para tráfego, vídeos acima de 1 min',
    price: null,
    whatsappMessage: message('em outro formato de vídeo'),
  },
];

export const packs: Pack[] = [
  {
    id: 'premium',
    name: 'Premium',
    items: [{ tierId: 'basico', quantity: 4 }],
    price: 128,
    validityDays: 15,
    highlighted: false,
    whatsappMessage: message('no Pacote Premium'),
  },
  {
    id: 'vip',
    name: 'VIP',
    items: [
      { tierId: 'basico', quantity: 4 },
      { tierId: 'intermediario', quantity: 4 },
    ],
    price: 280,
    validityDays: 30,
    highlighted: true,
    whatsappMessage: message('no Pacote VIP'),
  },
];

export const customContractMessage = message('em um contrato personalizado');

function unitPrice(tierId: Pack['items'][number]['tierId']): number {
  const price = tiers.find((t) => t.id === tierId)?.price;
  if (price == null) throw new Error(`Nível sem preço fixo: ${tierId}`);
  return price;
}

/** Soma dos vídeos avulsos que o pacote contém. */
export function packFullPrice(pack: Pack): number {
  return pack.items.reduce((sum, item) => sum + unitPrice(item.tierId) * item.quantity, 0);
}

export function packDiscountPercent(pack: Pack): number {
  return Math.round((1 - pack.price / packFullPrice(pack)) * 100);
}

export function packPricePerVideo(pack: Pack): number {
  return pack.price / pack.items.reduce((sum, item) => sum + item.quantity, 0);
}
