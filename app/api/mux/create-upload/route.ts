import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
  try {
    const upload = await mux.video.uploads.create({
      // Mux will create an asset automatically
      new_asset_settings: {
        playback_policy: ["public"], // easiest: no auth + no CORS pain
        encoding_tier: "smart",
      },

      // IMPORTANT: allow your site origin
      cors_origin: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
    });

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error("[v0] Mux upload creation error:", error);
    return NextResponse.json(
      { error: "Failed to create upload" },
      { status: 500 }
    );
  }
}
