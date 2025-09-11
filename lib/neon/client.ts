import { neon } from "@neondatabase/serverless"

export function createNeonClient() {
  console.log("[v0] Creating Neon client...")
  const databaseUrl = process.env.DATABASE_URL
  console.log("[v0] DATABASE_URL exists:", !!databaseUrl)
  console.log("[v0] DATABASE_URL length:", databaseUrl?.length || 0)

  if (!databaseUrl) {
    console.error("[v0] DATABASE_URL environment variable is missing!")
    throw new Error("DATABASE_URL environment variable is required")
  }

  try {
    console.log("[v0] Initializing Neon connection...")
    const client = neon(databaseUrl, {
      disableWarningInBrowsers: true,
    })
    console.log("[v0] Neon client initialized successfully")
    return client
  } catch (error) {
    console.error("[v0] Failed to create Neon client:", error)
    throw error
  }
}
