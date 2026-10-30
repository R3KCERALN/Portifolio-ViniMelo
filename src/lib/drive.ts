import { driveFixture } from './drive.fixture';

export const DIRECT_PLAY_MAX_BYTES = 100 * 1024 * 1024;

const DEFAULT_LIMIT = 10;
const VIDEO_EXTENSION = /\.(mp4|mov|m4v|webm|mkv|avi)$/i;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  thumbnailLink?: string;
  videoMediaMetadata?: { width?: number; height?: number; durationMillis?: string };
}

export type Playback = { kind: 'direct'; src: string } | { kind: 'iframe'; src: string };

export interface PortfolioVideo {
  id: string;
  title: string;
  createdTime: string;
  playback: Playback;
  posterUrl: string | null;
  aspectRatio: number;
}

export function titleFromFileName(name: string): string {
  return name.replace(VIDEO_EXTENSION, '').trim();
}

export function isVideoFile(file: DriveFile): boolean {
  return file.mimeType.startsWith('video/') || file.videoMediaMetadata !== undefined;
}

function playbackFor(file: DriveFile): Playback {
  const bytes = Number(file.size);
  const canPlayDirect = file.size !== undefined && Number.isFinite(bytes) && bytes > 0 && bytes <= DIRECT_PLAY_MAX_BYTES;
  return canPlayDirect
    ? { kind: 'direct', src: `https://drive.usercontent.google.com/download?id=${file.id}&export=download` }
    : { kind: 'iframe', src: `https://drive.google.com/file/d/${file.id}/preview` };
}

export function toPortfolioVideo(file: DriveFile): PortfolioVideo {
  const { width, height } = file.videoMediaMetadata ?? {};
  return {
    id: file.id,
    title: titleFromFileName(file.name),
    createdTime: file.createdTime,
    playback: playbackFor(file),
    posterUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+$/, '=s1280') : null,
    aspectRatio: width && height ? width / height : 9 / 16,
  };
}

const MISSING_KEY = 'GOOGLE_DRIVE_API_KEY não definida: defina a chave para buscar os vídeos do Drive no build.';

export async function fetchLatestVideos(opts: {
  apiKey: string | undefined;
  folderId: string;
  limit?: number;
  fetchImpl?: typeof fetch;
}): Promise<PortfolioVideo[]> {
  const { apiKey, folderId, limit = DEFAULT_LIMIT, fetchImpl = fetch } = opts;
  if (!apiKey) throw new Error(MISSING_KEY);

  const params = [
    ['q', `'${folderId}' in parents and trashed=false`],
    ['orderBy', 'createdTime desc'],
    ['pageSize', '100'],
    ['fields', 'files(id,name,mimeType,size,createdTime,thumbnailLink,videoMediaMetadata(width,height,durationMillis))'],
    ['key', apiKey],
  ];
  const url = `https://www.googleapis.com/drive/v3/files?${params
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`;

  let response: Response;
  try {
    response = await fetchImpl(url);
  } catch {
    // Não repassa o erro original: a mensagem pode carregar a URL com a chave.
    throw new Error('Drive API inacessível: a busca dos vídeos falhou.');
  }
  if (!response.ok) throw new Error(`Drive API respondeu ${response.status}.`);

  const data = (await response.json()) as { files?: DriveFile[] };
  const videos = (data.files ?? []).filter(isVideoFile).slice(0, limit).map(toPortfolioVideo);
  if (videos.length === 0) {
    throw new Error(`A pasta do Drive (${folderId}) não tem nenhum vídeo; o portfólio não será publicado vazio.`);
  }
  return videos;
}

export async function loadPortfolio(opts: {
  apiKey: string | undefined;
  isDev: boolean;
  folderId: string;
  fetchImpl?: typeof fetch;
}): Promise<PortfolioVideo[]> {
  if (opts.isDev && !opts.apiKey) {
    return driveFixture
      .filter(isVideoFile)
      .sort((a, b) => Date.parse(b.createdTime) - Date.parse(a.createdTime))
      .slice(0, DEFAULT_LIMIT)
      .map(toPortfolioVideo);
  }
  return fetchLatestVideos(opts);
}
