'use client'

/**
 * Parse filename to extract title and description
 * Examples:
 * - "flowsketch-chile-antarctica-van-gogh-aurora-vortex.png" 
 *   → title: "Chile Antarctica Van Gogh Aurora Vortex"
 * - "escher-channel-maze-panoramic.jpg"
 *   → title: "Escher Channel Maze Panoramic"
 */
export function parseFilenameMetadata(filename: string): { title: string; description: string } {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')

  // Remove timestamp suffix (e.g., -2026-01-20T14-39-54)
  const nameWithoutTimestamp = nameWithoutExt.replace(/-\d{4}-\d{2}-\d{2}T[\d-]+$/, '')

  // Remove common prefixes/patterns
  const cleanName = nameWithoutTimestamp
    .replace(/^flowsketch[-_]?/, '')
    .replace(/^sketch[-_]?/, '')
    .replace(/^image[-_]?/, '')
    .replace(/[-_]?(openai|dalle3|ai|generated)[-_]?/gi, '')
    .trim()

  // Split by hyphens or underscores and capitalize each word
  const words = cleanName.split(/[-_]+/).filter(w => w.length > 0)
  const title = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // Generate description from title and keywords
  let description = `Immersive 360° panoramic experience: ${title}`

  // Add context based on keywords found in filename
  const keywords = cleanName.toLowerCase()
  if (keywords.includes('van-gogh') || keywords.includes('vangogh')) {
    description += ' with artistic Van Gogh-inspired interpretation'
  }
  if (keywords.includes('aurora')) {
    description += ' featuring aurora lighting effects'
  }
  if (keywords.includes('panoramic') || keywords.includes('panorama')) {
    description = description.replace('Panoramic experience: ', '')
  }
  if (keywords.includes('chile') || keywords.includes('antarctica')) {
    description += ' of Antarctic and Chilean landscapes'
  }

  return { title, description }
}
