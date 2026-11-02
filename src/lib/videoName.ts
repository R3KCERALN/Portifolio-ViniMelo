export type VideoCategory = 'criativo' | 'institucional' | 'motion-ia';

export interface ParsedVideoName {
  title: string;
  category: VideoCategory | null;
  detail: string | null;
}

const CATEGORY_BY_TEXT: Record<string, VideoCategory> = {
  criativo: 'criativo',
  criativos: 'criativo',
  institucional: 'institucional',
  institucionais: 'institucional',
  'motion e ia': 'motion-ia',
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s*&\s*/g, ' e ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Lê o nome do arquivo no padrão `Título - Categoria - Detalhe` (detalhe opcional).
 * O trecho do meio só vira categoria se for uma das conhecidas; senão o nome inteiro é o título,
 * porque nomes antigos já têm " - " no meio ("… ACADEMIA - FOCO EM VENDA DE CONSULTORIA").
 */
export function parseVideoName(fileTitle: string): ParsedVideoName {
  const parts = fileTitle.split(' - ').map((part) => part.trim());
  const category = parts.length >= 2 ? CATEGORY_BY_TEXT[normalize(parts[1])] : undefined;
  if (!category || !parts[0]) return { title: fileTitle, category: null, detail: null };
  const detail = parts.slice(2).join(' - ');
  return { title: parts[0], category, detail: detail || null };
}

const LABEL: Record<VideoCategory, string> = {
  criativo: 'Criativo',
  institucional: 'Institucional',
  'motion-ia': 'Motion & IA',
};

const TAB_LABEL: Record<VideoCategory, string> = {
  criativo: 'Criativos',
  institucional: 'Institucionais',
  'motion-ia': 'Motion & IA',
};

export const categoryLabel = (category: VideoCategory) => LABEL[category];
export const categoryTabLabel = (category: VideoCategory) => TAB_LABEL[category];

/** Ordem das abas depois de "Todos". */
export const CATEGORY_ORDER: VideoCategory[] = ['criativo', 'institucional', 'motion-ia'];
