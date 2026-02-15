import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId" },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("[v0] Mux upload status error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve upload status" },
      { status: 500 }
    );
  }
}
