import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = createAdminClient()
    const code = params.code

    const { data, error } = await supabase
      .from("collections")
      .select("title, description, video_url")
      .eq("code", code)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch collection" },
      { status: 500 }
    )
  }
}
