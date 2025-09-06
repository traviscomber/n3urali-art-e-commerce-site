import { randomBytes, pbkdf2Sync } from "crypto"

export class PasswordManager {
  private static readonly SALT_LENGTH = 32
  private static readonly ITERATIONS = 100000
  private static readonly KEY_LENGTH = 64
  private static readonly ALGORITHM = "sha512"

  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(this.SALT_LENGTH).toString("hex")
    const hash = pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.ALGORITHM).toString("hex")
    return `${salt}:${hash}`
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedPassword.split(":")
      if (!salt || !hash) return false

      const verifyHash = pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.ALGORITHM).toString("hex")
      return hash === verifyHash
    } catch (error) {
      console.error("[v0] Password verification error:", error)
      return false
    }
  }

  static generateResetToken(): string {
    return randomBytes(32).toString("hex")
  }

  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
