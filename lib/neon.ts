import { neon } from "@neondatabase/serverless"

// Create a reusable Neon client function
export function createNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  return neon(process.env.DATABASE_URL)
}

// Export a default instance for convenience
export const sql = createNeonClient()
