import { createNeonClient } from "@/lib/neon/client"
import crypto from "crypto"

export interface PasswordResetToken {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  used_at?: string
  created_at: string
}

export async function createPasswordResetToken(
  email: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  const sql = createNeonClient()

  try {
    // Check if user exists
    const userResult = await sql`
      SELECT up.id, up.full_name, u.email
      FROM user_profiles up
      JOIN auth.users u ON up.id = u.id
      WHERE u.email = ${email}
      LIMIT 1
    `

    if (userResult.length === 0) {
      // Don't reveal that the email doesn't exist for security
      return { success: true }
    }

    const user = userResult[0]

    // Check for recent reset attempts to prevent abuse (max 3 per hour)
    const recentAttempts = await sql`
      SELECT COUNT(*) as count
      FROM password_reset_attempts
      WHERE email = ${email}
      AND created_at > NOW() - INTERVAL '1 hour'
    `

    if (recentAttempts[0].count >= 3) {
      return { success: false, error: "Too many password reset attempts. Please try again in an hour." }
    }

    // Check for existing valid token (within last 15 minutes)
    const existingToken = await sql`
      SELECT token
      FROM password_reset_tokens
      WHERE email = ${email}
      AND expires_at > NOW()
      AND used_at IS NULL
      AND created_at > NOW() - INTERVAL '15 minutes'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (existingToken.length > 0) {
      return {
        success: false,
        error:
          "A password reset email was already sent. Please check your email or wait 15 minutes before requesting another.",
      }
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex")

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Delete any old tokens for this user
    await sql`
      DELETE FROM password_reset_tokens 
      WHERE user_id = ${user.id}
    `

    // Create new reset token
    await sql`
      INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
      VALUES (${user.id}, ${email}, ${token}, ${expiresAt.toISOString()})
    `

    // Log the attempt
    await sql`
      INSERT INTO password_reset_attempts (email, ip_address, user_agent)
      VALUES (${email}, ${ipAddress || null}, ${userAgent || null})
    `

    return { success: true, token }
  } catch (error) {
    console.error("Error creating password reset token:", error)
    return { success: false, error: "Failed to create password reset token" }
  }
}

export async function validatePasswordResetToken(
  token: string,
): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
  const sql = createNeonClient()

  try {
    const tokenResult = await sql`
      SELECT user_id, email, expires_at, used_at
      FROM password_reset_tokens
      WHERE token = ${token}
      LIMIT 1
    `

    if (tokenResult.length === 0) {
      return { valid: false, error: "Invalid reset token" }
    }

    const tokenData = tokenResult[0]

    // Check if token is already used
    if (tokenData.used_at) {
      return { valid: false, error: "This reset link has already been used" }
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now > expiresAt) {
      return { valid: false, error: "This reset link has expired" }
    }

    return {
      valid: true,
      userId: tokenData.user_id,
      email: tokenData.email,
    }
  } catch (error) {
    console.error("Error validating password reset token:", error)
    return { valid: false, error: "Failed to validate reset token" }
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const sql = createNeonClient()

  try {
    // Validate token first
    const validation = await validatePasswordResetToken(token)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const { hashPassword } = await import("./password")
    const hashedPassword = await hashPassword(newPassword)

    // Update user's password
    await sql`
      UPDATE auth.users
      SET encrypted_password = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${validation.userId}
    `

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token = ${token}
    `

    // Invalidate all user sessions for security
    await sql`
      DELETE FROM user_sessions
      WHERE user_id = ${validation.userId}
    `

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Failed to reset password" }
  }
}
