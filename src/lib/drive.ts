import { driveFixture } from './drive.fixture';

const DEFAULT_LIMIT = 10;
const VIDEO_EXTENSION = /\.(mp4|mov|m4v|webm|mkv|avi)$/i;
const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  thumbnailLink?: string;
  videoMediaMetadata?: { width?: number; height?: number; durationMillis?: string };
}

export interface PortfolioVideo {
  id: string;
  title: string;
  createdTime: string;
  /** Player do Drive. O Drive recusa (403) o arquivo embutido por outro site, então não há reprodução direta. */
  embedUrl: string;
  posterUrl: string | null;
  aspectRatio: number;
}

export function titleFromFileName(name: string): string {
  return name.replace(VIDEO_EXTENSION, '').trim();
}

/**
 * Capa personalizada: uma imagem na mesma pasta com o mesmo nome do vídeo (ex.: `Logo 3D.jpg` para `Logo 3D.mp4`).
 * Serve para vídeos cuja miniatura do Drive é um quadro preto ou branco.
 */
function withCustomCovers(videos: PortfolioVideo[], files: DriveFile[]): PortfolioVideo[] {
  const key = (name: string) => name.trim().toLowerCase();
  const covers = new Map(
    files
      .filter((f) => f.mimeType.startsWith('image/'))
      .map((f) => [key(f.name.replace(IMAGE_EXTENSION, '')), f] as const),
  );
  return videos.map((video) => {
    const cover = covers.get(key(video.title));
    if (!cover) return video;
    const posterUrl = cover.thumbnailLink
      ? cover.thumbnailLink.replace(/=s\d+$/, '=s1280')
      : `https://lh3.googleusercontent.com/d/${cover.id}=w1280`;
    return { ...video, posterUrl };
  });
}

export function isVideoFile(file: DriveFile): boolean {
  return file.mimeType.startsWith('video/') || file.videoMediaMetadata !== undefined;
}

export function toPortfolioVideo(file: DriveFile): PortfolioVideo {
  const { width, height } = file.videoMediaMetadata ?? {};
  return {
    id: file.id,
    title: titleFromFileName(file.name),
    createdTime: file.createdTime,
    embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
    // Sem thumbnailLink, usa a miniatura pública do Drive (arquivo da pasta pública), que não exige chave.
    posterUrl: file.thumbnailLink
      ? file.thumbnailLink.replace(/=s\d+$/, '=s1280')
      : `https://lh3.googleusercontent.com/d/${file.id}=w1280`,
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
  const files = data.files ?? [];
  const videos = withCustomCovers(files.filter(isVideoFile).slice(0, limit).map(toPortfolioVideo), files);
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
