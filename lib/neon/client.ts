import { neon } from "@neondatabase/serverless"

export function createNeonClient() {
  console.log("[v0] createNeonClient: Starting client creation")

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error("[v0] createNeonClient: DATABASE_URL environment variable is missing")
    console.error(
      "[v0] createNeonClient: Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("DATABASE")),
    )
    throw new Error("DATABASE_URL environment variable is required")
  }

  console.log("[v0] createNeonClient: DATABASE_URL found, length:", databaseUrl.length)
  console.log("[v0] createNeonClient: URL starts with:", databaseUrl.substring(0, 20))

  try {
    const client = neon(databaseUrl)
    console.log("[v0] createNeonClient: Client created successfully")
    return client
  } catch (error) {
    console.error("[v0] createNeonClient: Failed to create client:", error)
    throw error
  }
}
