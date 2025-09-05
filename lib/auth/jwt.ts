let jwt: any = null
let jwtInitialized = false

async function initializeJWT() {
  if (jwtInitialized) return jwt

  try {
    jwt = await import("jsonwebtoken")
    jwtInitialized = true
    return jwt
  } catch (error) {
    console.error("Failed to initialize JWT library:", error)
    return null
  }
}

const JWT_EXPIRES_IN = "7d"

export interface JWTPayload {
  userId: string
  email: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    console.warn("JWT_SECRET environment variable is not set, using fallback")
    return "fallback-jwt-secret-for-development-only"
  }
  return JWT_SECRET
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  try {
    const jwtLib = await initializeJWT()
    if (!jwtLib) {
      throw new Error("JWT library not available")
    }

    const JWT_SECRET = getJWTSecret()
    const token = jwtLib.default.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "n3urali.art",
      audience: "n3urali.art-users",
    })
    return token
  } catch (error) {
    console.error("Error signing JWT:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const jwtLib = await initializeJWT()
    if (!jwtLib) {
      console.warn("JWT library not available, skipping token verification")
      return null
    }

    const JWT_SECRET = getJWTSecret()
    const decoded = jwtLib.default.verify(token, JWT_SECRET, {
      issuer: "n3urali.art",
      audience: "n3urali.art-users",
    }) as JWTPayload
    return decoded
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      console.log("JWT token expired")
    } else if (error?.name === "JsonWebTokenError") {
      console.log("Invalid JWT token")
    } else {
      console.error("JWT verification error:", error)
    }
    return null
  }
}

export async function refreshJWT(token: string): Promise<string | null> {
  const payload = await verifyJWT(token)
  if (!payload) {
    return null
  }

  // Create new token with fresh expiration
  const newPayload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: payload.userId,
    email: payload.email,
    isAdmin: payload.isAdmin,
  }

  return await signJWT(newPayload)
}
