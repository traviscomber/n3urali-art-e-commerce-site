import { MetadataRoute } from 'next'
import manifest from '../manifest'

export async function GET() {
  const manifestData: MetadataRoute.Manifest = manifest()
  return new Response(JSON.stringify(manifestData), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}
