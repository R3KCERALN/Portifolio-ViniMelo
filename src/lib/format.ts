const options = { style: 'currency', currency: 'BRL' } as const;
const whole = new Intl.NumberFormat('pt-BR', { ...options, minimumFractionDigits: 0, maximumFractionDigits: 0 });
const withCents = new Intl.NumberFormat('pt-BR', { ...options, minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatBRL(value: number): string {
  const formatter = Number.isInteger(value) ? whole : withCents;
  // Intl separa o símbolo do número com U+00A0; a spec usa espaço comum.
  return formatter.format(value).replace(/ /g, ' ');
}
