import { neon } from "@neondatabase/serverless"

export function createNeonClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required")
  }

  return neon(databaseUrl)
}
