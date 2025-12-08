/**
 * Utility functions for authentication checks
 */

export function isAdminUser(userEmail: string | undefined): boolean {
  const adminEmails = ["travis@nuanu.com"]
  const result = !!userEmail && adminEmails.includes(userEmail.toLowerCase())

  console.log("[v0] isAdminUser check:", {
    email: userEmail,
    isAdmin: result,
  })

  return result
}

// Check if user has purchased/owns an image
export function userOwnsImage(userId: string | undefined, imageId: string): boolean {
  // TODO: Implement actual ownership check from database
  return false
}
