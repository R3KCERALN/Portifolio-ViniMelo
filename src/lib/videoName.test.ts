import { describe, expect, it } from 'vitest';
import { categoryLabel, categoryTabLabel, parseVideoName } from './videoName';

describe('parseVideoName', () => {
  it('reads title, category and detail', () => {
    expect(parseVideoName('Efeito clone - Criativo - Consultoria fitness')).toEqual({
      title: 'Efeito clone',
      category: 'criativo',
      detail: 'Consultoria fitness',
    });
  });

  it('reads the institutional category', () => {
    expect(parseVideoName('SEA Telecom 10 anos - Institucional - Filme de aniversário')).toMatchObject({
      title: 'SEA Telecom 10 anos',
      category: 'institucional',
      detail: 'Filme de aniversário',
    });
  });

  it('accepts a category without detail, ignoring case and accents', () => {
    expect(parseVideoName('Logo 3D - motion e ia')).toEqual({ title: 'Logo 3D', category: 'motion-ia', detail: null });
    expect(parseVideoName('Logo 3D - Motion & IA')).toMatchObject({ category: 'motion-ia' });
    expect(parseVideoName('Spot - INSTITUCIONAIS')).toMatchObject({ category: 'institucional' });
    expect(parseVideoName('Spot - Criativos - Loja')).toMatchObject({ category: 'criativo', detail: 'Loja' });
  });

  it('keeps the whole name as the title when the middle part is not a category', () => {
    const name = 'CRIATIVO INFORMATIVO SOBRE ESTAGNAÇÃO NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA';
    expect(parseVideoName(name)).toEqual({ title: name, category: null, detail: null });
    expect(parseVideoName('VÍDEO TREND')).toEqual({ title: 'VÍDEO TREND', category: null, detail: null });
  });

  it('does not treat a lone category word as a pattern', () => {
    expect(parseVideoName('Criativo')).toEqual({ title: 'Criativo', category: null, detail: null });
  });
});

describe('category labels', () => {
  it('names the card metadata and the tabs', () => {
    expect(categoryLabel('criativo')).toBe('Criativo');
    expect(categoryLabel('institucional')).toBe('Institucional');
    expect(categoryLabel('motion-ia')).toBe('Motion & IA');
    expect(categoryTabLabel('criativo')).toBe('Criativos');
    expect(categoryTabLabel('institucional')).toBe('Institucionais');
    expect(categoryTabLabel('motion-ia')).toBe('Motion & IA');
  });
});
