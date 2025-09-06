export async function generatePresignedUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = 600,
): Promise<string> {
  const accessKeyId = process.env.BACKBLAZE_KEY_ID
  const secretAccessKey = process.env.BACKBLAZE_APPLICATION_KEY
  const region = process.env.B2_REGION || "us-east-005"
  const endpoint = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com"

  console.log("[v0] Presigned URL generation - accessKeyId exists:", !!accessKeyId)
  console.log("[v0] Presigned URL generation - secretAccessKey exists:", !!secretAccessKey)
  console.log("[v0] Presigned URL generation - bucket:", bucket)
  console.log("[v0] Presigned URL generation - key:", key)
  console.log("[v0] Presigned URL generation - region:", region)
  console.log("[v0] Presigned URL generation - endpoint:", endpoint)

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing Backblaze credentials: BACKBLAZE_KEY_ID or BACKBLAZE_APPLICATION_KEY")
  }

  if (!bucket) {
    throw new Error("Missing bucket name")
  }

  if (!key) {
    throw new Error("Missing object key")
  }

  let endpointUrl: URL
  try {
    endpointUrl = new URL(endpoint)
  } catch (error) {
    throw new Error(`Invalid endpoint URL: ${endpoint}`)
  }

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
  const dateStamp = amzDate.slice(0, 8)
  const expirationTime = Math.floor(now.getTime() / 1000) + expiresIn

  // Create canonical request
  const method = "PUT"
  const canonicalUri = `/${bucket}/${key}`
  const canonicalQueryString = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(accessKeyId)}%2F${dateStamp}%2F${region}%2Fs3%2Faws4_request&X-Amz-Date=${amzDate}&X-Amz-Expires=${expiresIn}&X-Amz-SignedHeaders=host`
  const canonicalHeaders = `host:${endpointUrl.host}\n`
  const signedHeaders = "host"
  const payloadHash = "UNSIGNED-PAYLOAD"

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n")

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256"
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`
  const stringToSign = [algorithm, amzDate, credentialScope, await sha256(canonicalRequest)].join("\n")

  // Calculate signature
  const signature = await calculateSignature(secretAccessKey, dateStamp, region, "s3", stringToSign)

  // Build presigned URL
  const presignedUrl = `${endpoint}/${bucket}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(accessKeyId)}%2F${dateStamp}%2F${region}%2Fs3%2Faws4_request&X-Amz-Date=${amzDate}&X-Amz-Expires=${expiresIn}&X-Amz-SignedHeaders=host&X-Amz-Signature=${signature}`

  console.log("[v0] Generated presigned URL length:", presignedUrl.length)
  console.log("[v0] Generated presigned URL starts with:", presignedUrl.substring(0, 100))

  return presignedUrl
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message))
  return new Uint8Array(signature)
}

async function calculateSignature(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
  stringToSign: string,
): Promise<string> {
  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${secretAccessKey}`), dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, "aws4_request")
  const signature = await hmacSha256(kSigning, stringToSign)

  return Array.from(signature)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
