import PhotoDetailClient from "@/components/photo-detail-client"

export const dynamic = "force-static"
export const revalidate = 86400

export default function PhotoDetailPage() {
  return <PhotoDetailClient />
}
