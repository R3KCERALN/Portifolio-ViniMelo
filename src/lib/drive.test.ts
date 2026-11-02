import { describe, expect, it, vi } from 'vitest';
import {
  fetchLatestVideos,
  isVideoFile,
  loadPortfolio,
  titleFromFileName,
  toPortfolioVideo,
  type DriveFile,
} from './drive';
import { driveFixture } from './drive.fixture';

const FOLDER = '1ZyPhsGCoH-G2pOJFK9ihSGrPJfaHmxx2';
const MB = 1024 * 1024;

const base: DriveFile = {
  id: 'ID',
  name: 'video.mp4',
  mimeType: 'video/mp4',
  size: String(10 * MB),
  createdTime: '2026-10-01T00:00:00.000Z',
};

function makeFiles(videos: number, extra: DriveFile[] = []): DriveFile[] {
  const list = Array.from({ length: videos }, (_, i) => ({
    ...base,
    id: `v${i}`,
    name: `Video ${i}.mp4`,
    createdTime: new Date(Date.UTC(2026, 9, 30 - i)).toISOString(),
  }));
  return [...list, ...extra];
}

function fakeFetch(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe('titleFromFileName', () => {
  it('drops only the final video extension', () => {
    expect(titleFromFileName('CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS.mp4')).toBe(
      'CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS',
    );
    expect(titleFromFileName('PROMO SAPATILHAS.COM.MP4')).toBe('PROMO SAPATILHAS.COM');
    expect(titleFromFileName('making of.mov')).toBe('making of');
  });

  it('trims the space left before the extension', () => {
    expect(titleFromFileName('VÍDEO TREND .mp4')).toBe('VÍDEO TREND');
  });

  it('keeps names without extension', () => {
    expect(
      titleFromFileName('CRIATIVO SOBRE CORREÇÃO DE EXERCÍCIOS NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA'),
    ).toBe('CRIATIVO SOBRE CORREÇÃO DE EXERCÍCIOS NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA');
  });
});

describe('isVideoFile', () => {
  it('accepts video mime types and files with video metadata', () => {
    expect(isVideoFile({ ...base, mimeType: 'video/mp4' })).toBe(true);
    expect(isVideoFile({ ...base, mimeType: 'application/octet-stream', videoMediaMetadata: { width: 1080 } })).toBe(true);
  });

  it('rejects folders and other files', () => {
    expect(isVideoFile({ ...base, mimeType: 'application/vnd.google-apps.folder' })).toBe(false);
    expect(isVideoFile({ ...base, mimeType: 'image/png' })).toBe(false);
  });
});

describe('toPortfolioVideo', () => {
  // O Drive recusa (403) vídeo embutido por outro site; só o player dele toca fora do drive.google.com.
  it('always plays in the Drive player, whatever the size', () => {
    for (const size of [String(8 * MB), String(101 * MB), undefined, 'abc']) {
      expect(toPortfolioVideo({ ...base, id: 'A', size }).embedUrl).toBe('https://drive.google.com/file/d/A/preview');
    }
  });

  it('builds the poster from the thumbnail link', () => {
    expect(toPortfolioVideo({ ...base, thumbnailLink: 'https://lh3.googleusercontent.com/x=s220' }).posterUrl).toBe(
      'https://lh3.googleusercontent.com/x=s1280',
    );
    expect(toPortfolioVideo({ ...base, id: 'A' }).posterUrl).toBe('https://lh3.googleusercontent.com/d/A=w1280');
  });

  it('derives the aspect ratio from the metadata, defaulting to 9:16', () => {
    expect(toPortfolioVideo({ ...base, videoMediaMetadata: { width: 1920, height: 1080 } }).aspectRatio).toBeCloseTo(16 / 9);
    expect(toPortfolioVideo({ ...base }).aspectRatio).toBeCloseTo(9 / 16);
    expect(toPortfolioVideo({ ...base, videoMediaMetadata: { width: 1920 } }).aspectRatio).toBeCloseTo(9 / 16);
  });

  it('uses the cleaned file name as title', () => {
    expect(toPortfolioVideo({ ...base, name: 'VÍDEO TREND .mp4' }).title).toBe('VÍDEO TREND');
  });
});

describe('fetchLatestVideos', () => {
  const folder: DriveFile = { ...base, id: 'F', name: 'pasta', mimeType: 'application/vnd.google-apps.folder' };

  it('returns the 10 first videos in the received order, without folders', async () => {
    const fetchImpl = fakeFetch({ files: makeFiles(12, [folder]) });
    const videos = await fetchLatestVideos({ apiKey: 'k', folderId: FOLDER, fetchImpl });
    expect(videos).toHaveLength(10);
    expect(videos.map((v) => v.id)).toEqual(Array.from({ length: 10 }, (_, i) => `v${i}`));
  });

  it('returns fewer when the folder has fewer', async () => {
    const videos = await fetchLatestVideos({ apiKey: 'k', folderId: FOLDER, fetchImpl: fakeFetch({ files: makeFiles(3) }) });
    expect(videos).toHaveLength(3);
  });

  it('rejects when there is no video', async () => {
    await expect(
      fetchLatestVideos({ apiKey: 'k', folderId: FOLDER, fetchImpl: fakeFetch({ files: [folder] }) }),
    ).rejects.toThrow(/nenhum vídeo/i);
    await expect(fetchLatestVideos({ apiKey: 'k', folderId: FOLDER, fetchImpl: fakeFetch({}) })).rejects.toThrow(
      /nenhum vídeo/i,
    );
  });

  it('rejects on an HTTP error without leaking the key', async () => {
    const promise = fetchLatestVideos({ apiKey: 'secret-key', folderId: FOLDER, fetchImpl: fakeFetch({}, 403) });
    await expect(promise).rejects.toThrow(/Drive API respondeu 403/);
    await expect(promise).rejects.not.toThrow(/secret-key/);
  });

  it('rejects without an API key, before any request', async () => {
    const fetchImpl = fakeFetch({ files: makeFiles(1) });
    await expect(fetchLatestVideos({ apiKey: undefined, folderId: FOLDER, fetchImpl })).rejects.toThrow(/GOOGLE_DRIVE_API_KEY/);
    await expect(fetchLatestVideos({ apiKey: '', folderId: FOLDER, fetchImpl })).rejects.toThrow(/GOOGLE_DRIVE_API_KEY/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('asks the API for the newest files of the folder', async () => {
    const fetchImpl = fakeFetch({ files: makeFiles(1) });
    await fetchLatestVideos({ apiKey: 'k', folderId: FOLDER, fetchImpl });
    const url = String((fetchImpl.mock.calls[0] as unknown[])[0]);
    expect(url).toContain('https://www.googleapis.com/drive/v3/files?');
    expect(url).toContain('orderBy=createdTime%20desc');
    expect(url).toContain('pageSize=100');
    expect(url).toContain(`q=${encodeURIComponent(`'${FOLDER}' in parents and trashed=false`)}`);
    expect(url).toContain('key=k');
  });

  it('wraps network failures without leaking the key', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    await expect(fetchLatestVideos({ apiKey: 'secret-key', folderId: FOLDER, fetchImpl })).rejects.toThrow(
      /Drive API/,
    );
  });
});

describe('custom cover', () => {
  const image = (name: string, extra: Partial<DriveFile> = {}): DriveFile => ({
    id: `img-${name}`,
    name,
    mimeType: 'image/jpeg',
    createdTime: '2026-10-01T00:00:00.000Z',
    ...extra,
  });

  it('uses an image with the same name as the video as its cover', async () => {
    const files = makeFiles(2, [image('Video 1.jpg')]);
    const videos = await fetchLatestVideos({ apiKey: 'K', folderId: FOLDER, fetchImpl: fakeFetch({ files }) });
    expect(videos[1].posterUrl).toBe('https://lh3.googleusercontent.com/d/img-Video 1.jpg=w1280');
    expect(videos[0].posterUrl).toBe('https://lh3.googleusercontent.com/d/v0=w1280');
  });

  it('matches ignoring case, spaces before the extension and the image format', async () => {
    const files = makeFiles(1, [image('video 0 .PNG', { thumbnailLink: 'https://lh3.googleusercontent.com/abc=s220' })]);
    const [video] = await fetchLatestVideos({ apiKey: 'K', folderId: FOLDER, fetchImpl: fakeFetch({ files }) });
    expect(video.posterUrl).toBe('https://lh3.googleusercontent.com/abc=s1280');
  });

  it('never counts the cover image as a video', async () => {
    const files = makeFiles(1, [image('Video 0.jpg')]);
    const videos = await fetchLatestVideos({ apiKey: 'K', folderId: FOLDER, fetchImpl: fakeFetch({ files }) });
    expect(videos).toHaveLength(1);
  });
});

describe('loadPortfolio', () => {
  it('uses the fixture in dev without a key, without calling fetch', async () => {
    const fetchImpl = fakeFetch({});
    const videos = await loadPortfolio({ apiKey: undefined, isDev: true, folderId: FOLDER, fetchImpl });
    expect(videos).toHaveLength(10);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('never uses the fixture in production', async () => {
    await expect(loadPortfolio({ apiKey: undefined, isDev: false, folderId: FOLDER })).rejects.toThrow(
      /GOOGLE_DRIVE_API_KEY/,
    );
  });

  it('calls the API when there is a key, even in dev', async () => {
    const fetchImpl = fakeFetch({ files: makeFiles(2) });
    const videos = await loadPortfolio({ apiKey: 'k', isDev: true, folderId: FOLDER, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(videos).toHaveLength(2);
  });
});

describe('driveFixture', () => {
  it('mirrors the real folder', () => {
    expect(driveFixture).toHaveLength(11);
    const times = driveFixture.map((f) => Date.parse(f.createdTime));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});
