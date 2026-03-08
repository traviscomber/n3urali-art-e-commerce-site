import { redirect } from "next/navigation"

// Mark as dynamic to prevent prerender issues with redirects
export const dynamic = 'force-dynamic'

export default function FisheyeCategoryPage() {
  redirect("/gallery?tab=360")
}
