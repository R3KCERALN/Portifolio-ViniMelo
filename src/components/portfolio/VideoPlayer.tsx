import { useState } from 'react';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import type { PortfolioVideo } from '@/lib/drive';

interface Props {
  video: PortfolioVideo;
  poster: string | null;
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

// Arquivos acima do limite não tocam direto: o Drive só serve o player dele, e só depois do clique.
function DriveEmbed({ video, poster }: Props) {
  const [started, setStarted] = useState(false);
  const { playback } = video;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-border bg-card"
      style={{ aspectRatio: video.aspectRatio }}
    >
      {started && playback.kind === 'iframe' ? (
        <iframe
          src={playback.src}
          title={video.title}
          allow="autoplay; fullscreen"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />}
          <button
            type="button"
            onClick={() => setStarted(true)}
            aria-label={`Reproduzir ${video.title}`}
            className="absolute inset-0 flex items-center justify-center text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary"
          >
            <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/70 transition-colors hover:bg-black/85">
              <PlayIcon />
            </span>
          </button>
        </>
      )}
    </div>
  );
}

export default function VideoPlayer({ video, poster }: Props) {
  if (video.playback.kind === 'iframe') return <DriveEmbed video={video} poster={poster} />;

  return (
    <MediaPlayer
      src={{ src: video.playback.src, type: 'video/mp4' }}
      title={video.title}
      load="play"
      posterLoad="visible"
      playsInline
      aspectRatio={String(video.aspectRatio)}
      className="overflow-hidden rounded-lg border border-border bg-card"
      style={{ '--video-brand': '#4da3ff' } as React.CSSProperties}
    >
      <MediaProvider>{poster && <Poster className="vds-poster" src={poster} alt="" />}</MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
