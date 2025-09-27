import { createClient } from "@/lib/supabase/server"

// Helper function to get Supabase client for database operations
export async function getSupabaseClient() {
  return await createClient()
}

// Database error handler
export function handleDatabaseError(error: any, functionName?: string): { success: false; error: string } {
  console.error(`[v0] Database error in ${functionName || "unknown function"}:`, error)

  if (typeof error === "string") {
    if (
      error.includes("Request Entity Too Large") ||
      error.includes("413") ||
      error.includes("FUNCTION_PAYLOAD_TOO_LARGE")
    ) {
      return {
        success: false,
        error:
          "File payload too large for serverless function. Maximum supported size is 10MB after compression. Please use a smaller image.",
      }
    }
    if (error.includes("timeout") || error.includes("TIMEOUT")) {
      return {
        success: false,
        error: "Upload timeout. Large files may take longer. Please try again or use a smaller file.",
      }
    }
  }

  if (error?.message && error.message.includes("Body exceeded")) {
    return {
      success: false,
      error: "Upload payload too large. Please use a smaller image or contact support.",
    }
  }

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Database operation failed"

  return {
    success: false,
    error: errorMessage,
  }
}
