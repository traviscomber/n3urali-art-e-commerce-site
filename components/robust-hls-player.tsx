# ONE SHEET — N3URALIA360 ROBUST VIDEO PLAYER SYSTEM (CODED) — Next.js (App Router) + Vercel + Mux (NO CORS, BIG HD FILES)

## WHAT YOU GET
✅ Direct uploads (big files) without Vercel proxy  
✅ Adaptive streaming (HLS .m3u8) for smooth HD/4K playback  
✅ No CORS errors (Mux serves correctly; we whitelist your domain)  
✅ Production-grade player with Safari native HLS + hls.js fallback + auto-recovery  
✅ Minimal moving parts, easy to extend (DB, auth, private videos)

---

## 0) Install deps
\`\`\`bash
npm i @mux/mux-node hls.js
1) Env Vars (Vercel + .env.local)
Add these in Vercel Project → Settings → Environment Variables, and locally in .env.local:

MUX_TOKEN_ID=YOUR_MUX_TOKEN_ID
MUX_TOKEN_SECRET=YOUR_MUX_TOKEN_SECRET

# Optional (only if you want signed/private playback later)
# MUX_SIGNING_KEY_ID=...
# MUX_SIGNING_KEY_PRIVATE=...
2) FILE: /components/RobustHlsPlayer.tsx
Create this file:

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
3) FILE: /app/api/mux/create-upload/route.ts
Creates a Direct Upload URL so the browser uploads straight to Mux (no Vercel file handling).

import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
  const upload = await mux.video.uploads.create({
    // Mux will create an asset automatically
    new_asset_settings: {
      playback_policy: ["public"], // easiest: no auth + no CORS pain
      encoding_tier: "smart",
    },

    // IMPORTANT: allow your site origin
    cors_origin: "https://www.n3uralia360.art",
  });

  return NextResponse.json({
    uploadUrl: upload.url,
    uploadId: upload.id,
  });
}
4) FILE: /app/api/mux/upload-status/route.ts
Poll this after upload to get playbackId when ready.

import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get("uploadId");
  if (!uploadId) {
    return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });
  }

  const upload = await mux.video.uploads.retrieve(uploadId);
  const assetId = upload.asset_id ?? null;

  if (!assetId) {
    return NextResponse.json({
      uploadStatus: upload.status,
      assetId: null,
      assetStatus: null,
      playbackId: null,
    });
  }

  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  return NextResponse.json({
    uploadStatus: upload.status,
    assetId,
    assetStatus: asset.status,
    playbackId,
  });
}
5) FILE: /app/studio/upload/page.tsx
A simple upload page (big files OK) that returns a Mux playbackId.

"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleUpload() {
    if (!file) return;

    setStatus("Creating upload…");
    const res = await fetch("/api/mux/create-upload", { method: "POST" });
    const { uploadUrl, uploadId } = await res.json();
    setUploadId(uploadId);

    setStatus("Uploading (direct to Mux)…");
    const up = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "video/mp4" },
    });

    if (!up.ok) {
      setStatus("Upload failed.");
      return;
    }

    setStatus("Upload complete. Processing…");

    // Poll until playbackId exists
    const poll = async () => {
      const st = await fetch(`/api/mux/upload-status?uploadId=${encodeURIComponent(uploadId)}`);
      const data = await st.json();

      if (data.playbackId) {
        setPlaybackId(data.playbackId);
        setStatus("Ready ✅");
        return;
      }
      setTimeout(poll, 1500);
    };

    poll();
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Upload video (Mux HLS)</h1>
      <p style={{ opacity: 0.8 }}>
        Big files supported. Uploads go directly to Mux (no Vercel limits). Playback is adaptive HLS.
      </p>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleUpload}
          disabled={!file}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            cursor: file ? "pointer" : "not-allowed",
          }}
        >
          Upload
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div><strong>Status:</strong> {status || "-"}</div>
        <div><strong>Upload ID:</strong> {uploadId || "-"}</div>
        <div><strong>Playback ID:</strong> {playbackId || "-"}</div>
      </div>

      {playbackId && (
        <div style={{ marginTop: 20, padding: 12, border: "1px solid #333", borderRadius: 12 }}>
          <div style={{ marginBottom: 8, opacity: 0.85 }}>
            Your HLS URL (use anywhere):
          </div>
          <code style={{ display: "block", overflowWrap: "anywhere" }}>
            https://stream.mux.com/{playbackId}.m3u8
          </code>
        </div>
      )}
    </div>
  );
}
6) FILE: /app/watch/[playbackId]/page.tsx
A simple watch page that uses your robust player.

import RobustHlsPlayer from "@/components/RobustHlsPlayer";

export default async function WatchPage({
  params,
}: {
  params: { playbackId: string };
}) {
  const src = `https://stream.mux.com/${params.playbackId}.m3u8`;

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>N3uralia360 Player</h1>
      <div style={{ marginTop: 16 }}>
        <RobustHlsPlayer src={src} controls />
      </div>
      <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
        Source: {src}
      </div>
    </div>
  );
}
7) HOW TO USE (END-TO-END)
Go to /studio/upload

Upload an MP4 (any size)

You get a playbackId

Open /watch/<playbackId>

It streams via HLS, no CORS errors, HD adaptive

NOTES (IMPORTANT)
This avoids Vercel file limits because the browser uploads straight to Mux.

If you want PRIVATE videos (signed playback), tell me and I’ll extend this sheet to:
✅ signed URLs + expiring tokens
✅ Supabase DB model for videos
✅ user auth gating + role access
