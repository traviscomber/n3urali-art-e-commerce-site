import type { Metadata } from "next"
import AboutClientPage from "./client-page"

export const metadata: Metadata = {
  title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
  description:
    "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography. Part of the n3uralia group, discover our mission, technology, and commitment to professional-grade visual content for VR, projection mapping, and architectural visualization.",
  keywords: [
    "about n3uralia360.art",
    "n3uralia group",
    "AI photography company",
    "360 degree photography pioneers",
    "immersive imagery technology",
    "professional VR content creation",
    "who creates 360 images",
    "AI generated photography company",
    "equirectangular image specialists",
  ],
  openGraph: {
    title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
    description:
      "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography for professional applications. Part of the n3uralia group.",
    type: "website",
    url: "https://www.n3uralia360.art/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About n3uralia360.art - AI-Powered 360° Photography Pioneers",
    description:
      "Learn how n3uralia360.art revolutionizes immersive imagery with AI-generated 360° photography for professional applications. Part of the n3uralia group.",
  },
  alternates: {
    canonical: "https://www.n3uralia360.art/about",
  },
}

export default function AboutPage() {
  return <AboutClientPage />
}
