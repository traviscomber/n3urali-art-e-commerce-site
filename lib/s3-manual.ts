/**
 * S3-compatible manual presigned URL generation for Backblaze B2
 */

import { createHmac } from "crypto"

interface BackblazeConfig {
  endpoint: string
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

function getBackblazeConfig(): BackblazeConfig {
  return {
    endpoint: process.env.B2_ENDPOINT || "https://s3.us-west-004.backblazeb2.com",
    bucket: process.env.BACKBLAZE_BUCKET_NAME || "Neuraliart",
    region: process.env.B2_REGION || "us-west-004",
    accessKeyId: process.env.BACKBLAZE_API_KEY!,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  }
}

function createSignature(
  method: string,
  canonicalUri: string,
  canonicalQueryString: string,
  canonicalHeaders: string,
  signedHeaders: string,
  payloadHash: string,
  timestamp: string,
  region: string,
  service: string,
  secretKey: string,
): string {
  const algorithm = "AWS4-HMAC-SHA256"
  const credentialScope = `${timestamp.slice(0, 8)}/${region}/${service}/aws4_request`

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n")

  const canonicalRequestHash = createHmac("sha256", "").update(canonicalRequest).digest("hex")

  const stringToSign = [algorithm, timestamp, credentialScope, canonicalRequestHash].join("\n")

  const dateKey = createHmac("sha256", `AWS4${secretKey}`).update(timestamp.slice(0, 8)).digest()

  const dateRegionKey = createHmac("sha256", dateKey).update(region).digest()

  const dateRegionServiceKey = createHmac("sha256", dateRegionKey).update(service).digest()

  const signingKey = createHmac("sha256", dateRegionServiceKey).update("aws4_request").digest()

  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex")

  return signature
}

export async function generatePresignedUrl(
  bucketName: string,
  key: string,
  contentType: string,
  expiresInSeconds = 600,
): Promise<string> {
  const config = getBackblazeConfig()

  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "")
  const date = timestamp.slice(0, 8)

  const canonicalUri = `/${key}`
  const host = new URL(config.endpoint).host

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${date}/${config.region}/s3/aws4_request`,
    "X-Amz-Date": timestamp,
    "X-Amz-Expires": expiresInSeconds.toString(),
    "X-Amz-SignedHeaders": "host",
  })

  const canonicalQueryString = queryParams.toString()
  const canonicalHeaders = `host:${host}\n`
  const signedHeaders = "host"
  const payloadHash = "UNSIGNED-PAYLOAD"

  const signature = createSignature(
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
    timestamp,
    config.region,
    "s3",
    config.secretAccessKey,
  )

  queryParams.set("X-Amz-Signature", signature)

  const presignedUrl = `${config.endpoint}${canonicalUri}?${queryParams.toString()}`

  console.log("[v0] Generated presigned URL for:", key)
  return presignedUrl
}
