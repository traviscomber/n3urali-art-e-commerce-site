import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)

    if (!error) {
      // Redirect to a success page or dashboard
      redirect("/")
    }
  }

  // Redirect to an error page if something went wrong
  redirect("/auth/error")
}
