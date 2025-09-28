import { redirect } from "next/navigation"

export default function EquirectangularCategoryPage() {
  redirect("/gallery?tab=360")
}
