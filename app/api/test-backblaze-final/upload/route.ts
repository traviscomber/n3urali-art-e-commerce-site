import { type NextRequest, NextResponse } from "next/server"
import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file provided",
      })
    }

    const backblaze = new WorkingBackblazeStorage()
    const key = `test-uploads/${Date.now()}-${file.name}`

    const publicUrl = await backblaze.uploadFile(file, key)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        key: key,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error: any) {
    console.error("[v0] Test upload error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
