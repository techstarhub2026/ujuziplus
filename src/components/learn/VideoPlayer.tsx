"use client";

/**
 * VideoPlayer — YouTube, Vimeo, or direct file.
 * Calls onExplored once when the learner watches through to the end.
 */

import { useEffect, useRef, useCallback } from "react";

function youtubeId(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null;
}

function vimeoId(url: string) {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    });
  }
  return ytApiPromise;
}

function useExploreOnce(onExplored?: () => void) {
  const fired = useRef(false);
  const fire = useCallback(() => {
    if (fired.current || !onExplored) return;
    fired.current = true;
    onExplored();
  }, [onExplored]);

  useEffect(() => {
    fired.current = false;
  }, [onExplored]);

  return fire;
}

function YoutubeEmbed({
  videoId,
  title,
  onExplored,
}: {
  videoId: string;
  title?: string;
  onExplored?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fire = useExploreOnce(onExplored);

  useEffect(() => {
    let player: { destroy?: () => void } | null = null;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;
      player = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT!.PlayerState.ENDED) fire();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy?.();
    };
  }, [videoId, fire]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <div ref={hostRef} className="h-full w-full" title={title ?? "Video lesson"} />
    </div>
  );
}

function VimeoEmbed({
  videoId,
  title,
  onExplored,
}: {
  videoId: string;
  title?: string;
  onExplored?: () => void;
}) {
  const fire = useExploreOnce(onExplored);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://player.vimeo.com") return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "finish") fire();
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [fire]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?api=1`}
        title={title ?? "Video lesson"}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function VideoPlayer({
  url,
  title,
  onExplored,
}: {
  url: string;
  title?: string;
  onExplored?: () => void;
}) {
  const fire = useExploreOnce(onExplored);
  const ytId = /youtube\.com|youtu\.be/.test(url) ? youtubeId(url) : null;
  const vmId = /vimeo\.com/.test(url) ? vimeoId(url) : null;

  if (ytId) {
    return <YoutubeEmbed videoId={ytId} title={title} onExplored={onExplored} />;
  }

  if (vmId) {
    return <VimeoEmbed videoId={vmId} title={title} onExplored={onExplored} />;
  }

  return (
    <video
      src={url}
      controls
      className="max-h-[70vh] w-full rounded-lg bg-black"
      title={title}
      onEnded={fire}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (v.duration > 0 && v.currentTime / v.duration >= 0.92) fire();
      }}
    >
      Your browser does not support the video tag.
    </video>
  );
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: { onStateChange?: (e: { data: number }) => void };
        }
      ) => { destroy?: () => void };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
