import { S3Client } from "@aws-sdk/client-s3"

export const s3 = new S3Client({
  region: process.env.B2_REGION || "us-east-005",
  endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  },
  forcePathStyle: true, // important for Backblaze S3
})
