"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  src: string; // HLS .m3u8 URL
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  className?: string;
};

export default function RobustHlsPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  loop = false,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setErr(null);

    // Safari/iOS native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;

      const onErr = () => setErr("Video failed to load.");
      video.addEventListener("error", onErr);

      if (autoPlay) video.play().catch(() => {});
      return () => video.removeEventListener("error", onErr);
    }

    // Chrome/Firefox/Edge => hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 120,
        maxMaxBufferLength: 300,
        capLevelToPlayerSize: true,
        startLevel: -1,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad(); // recover network
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError(); // recover decoding
          return;
        }

        hls.destroy();
        setErr("Fatal playback error.");
      });

      return () => hls.destroy();
    }

    // Rare fallback
    video.src = src;
  }, [src, autoPlay]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        background: "#000",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {err && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff4d4d",
            padding: 16,
            textAlign: "center",
            background: "#000",
            zIndex: 2,
          }}
        >
          {err}
        </div>
      )}

      <video
        ref={videoRef}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        poster={poster}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}
