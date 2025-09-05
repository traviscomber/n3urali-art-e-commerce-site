import { createNeonClient } from "@/lib/neon/client"
import crypto from "crypto"

export interface EmailVerificationToken {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  verified_at?: string
  created_at: string
}

export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  const sql = createNeonClient()

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex")

  // Token expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  try {
    // Delete any existing tokens for this user
    await sql`
      DELETE FROM email_verification_tokens 
      WHERE user_id = ${userId} AND email = ${email}
    `

    // Create new verification token
    await sql`
      INSERT INTO email_verification_tokens (user_id, email, token, expires_at)
      VALUES (${userId}, ${email}, ${token}, ${expiresAt.toISOString()})
    `

    return token
  } catch (error) {
    console.error("Error creating email verification token:", error)
    throw new Error("Failed to create email verification token")
  }
}

export async function verifyEmailToken(
  token: string,
): Promise<{ success: boolean; userId?: string; email?: string; error?: string }> {
  const sql = createNeonClient()

  try {
    // Find the token and check if it's valid
    const tokenResult = await sql`
      SELECT user_id, email, expires_at, verified_at
      FROM email_verification_tokens
      WHERE token = ${token}
      LIMIT 1
    `

    if (tokenResult.length === 0) {
      return { success: false, error: "Invalid verification token" }
    }

    const tokenData = tokenResult[0]

    // Check if token is already used
    if (tokenData.verified_at) {
      return { success: false, error: "Verification token has already been used" }
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now > expiresAt) {
      return { success: false, error: "Verification token has expired" }
    }

    // Mark token as verified
    await sql`
      UPDATE email_verification_tokens
      SET verified_at = NOW()
      WHERE token = ${token}
    `

    // Update user profile to mark email as verified
    await sql`
      UPDATE user_profiles
      SET email_verified = TRUE, email_verified_at = NOW()
      WHERE id = ${tokenData.user_id}
    `

    return {
      success: true,
      userId: tokenData.user_id,
      email: tokenData.email,
    }
  } catch (error) {
    console.error("Error verifying email token:", error)
    return { success: false, error: "Failed to verify email token" }
  }
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const sql = createNeonClient()

  try {
    const result = await sql`
      SELECT email_verified
      FROM user_profiles
      WHERE id = ${userId}
      LIMIT 1
    `

    return result.length > 0 && result[0].email_verified === true
  } catch (error) {
    console.error("Error checking email verification status:", error)
    return false
  }
}

export async function resendVerificationEmail(userId: string, email: string): Promise<string> {
  // Check if user already has a recent token
  const sql = createNeonClient()

  const recentToken = await sql`
    SELECT created_at
    FROM email_verification_tokens
    WHERE user_id = ${userId} AND email = ${email}
    AND created_at > NOW() - INTERVAL '5 minutes'
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (recentToken.length > 0) {
    throw new Error("Please wait 5 minutes before requesting another verification email")
  }

  return createEmailVerificationToken(userId, email)
}
