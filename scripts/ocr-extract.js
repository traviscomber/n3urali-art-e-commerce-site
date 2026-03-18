import fetch from 'node-fetch'

async function extractTextFromImage() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[v0] Error: OPENAI_API_KEY environment variable not set')
    process.exit(1)
  }

  const imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ShowsPageN.png-nGajoWvD8FnPwaR3n7yWorhd0vjsUS.jpeg'

  try {
    console.log('[v0] Starting OCR extraction from image...')
    console.log(`[v0] Image URL: ${imageUrl}`)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract ALL text from this image exactly as it appears. Organize by sections (Hero, Projects, Production, Collaboration). Format as JSON with section names as keys and the text content as values. Include all paragraph text, titles, button labels, and descriptions.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] OpenAI API error:', error)
      process.exit(1)
    }

    const data = await response.json()
    const extractedText = data.choices[0].message.content

    console.log('[v0] OCR Extraction Complete:')
    console.log('============================================')
    console.log(extractedText)
    console.log('============================================')

    // Save to file
    const fs = await import('fs').then(m => m.promises)
    await fs.writeFile(
      '/vercel/share/v0-project/scripts/extracted-text.json',
      extractedText,
      'utf8'
    )
    console.log('[v0] Extracted text saved to scripts/extracted-text.json')
  } catch (error) {
    console.error('[v0] Error during OCR extraction:', error.message)
    process.exit(1)
  }
}

extractTextFromImage()
