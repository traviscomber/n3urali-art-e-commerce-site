import type { Metadata } from "next"
import GalleryClient from "./gallery-client"

export const metadata: Metadata = {
  title: "Gallery - Premium 360° Image Collection",
  description:
    "Browse our complete gallery of AI-generated equirectangular and fisheye images. High-resolution 4K-16K imagery perfect for VR, projection mapping, and professional visualization projects.",
  keywords: [
    "360 gallery",
    "equirectangular images",
    "fisheye photography",
    "VR images",
    "projection mapping",
    "immersive gallery",
    "panoramic collection",
  ],
  openGraph: {
    title: "Gallery - Premium 360° Image Collection | N3urali.art",
    description:
      "Browse our complete gallery of AI-generated equirectangular and fisheye images. High-resolution 4K-16K imagery perfect for VR, projection mapping, and professional visualization projects.",
    type: "website",
    url: "https://n3urali.art/gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery - Premium 360° Image Collection | N3urali.art",
    description:
      "Browse our complete gallery of AI-generated equirectangular and fisheye images. High-resolution 4K-16K imagery perfect for VR, projection mapping, and professional visualization projects.",
  },
  alternates: {
    canonical: "https://n3urali.art/gallery",
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}
