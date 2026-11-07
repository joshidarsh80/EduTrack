import React, { useMemo } from 'react';
import { Video, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  // Extract YouTube ID or embed URL
  const embedUrl = useMemo(() => {
    if (!videoUrl) return null;

    try {
      // 1. Direct embed link
      if (videoUrl.includes('youtube.com/embed/')) {
        return videoUrl;
      }

      // 2. Standard watch?v= link
      const watchMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (watchMatch && watchMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`;
      }

      // 3. Fallback for valid URLs
      if (videoUrl.startsWith('http')) {
        return videoUrl;
      }
    } catch {
      return null;
    }
    return null;
  }, [videoUrl]);

  if (!videoUrl || !embedUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl border border-slate-200 bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center shadow-inner">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
          <Video className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">Text-Based Learning Module</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          This lesson contains rich reading material and study documentation below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded bg-black/80 px-2 py-1 text-[10px] text-white backdrop-blur-xs hover:bg-black"
        >
          <ExternalLink className="w-3 h-3" />
          Open YouTube
        </a>
      </div>
    </div>
  );
};
