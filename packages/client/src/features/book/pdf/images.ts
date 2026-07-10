// fetches external images and re-encodes them as JPEG/PNG data URLs
// (pdfmake only supports JPEG/PNG — webp/gif must be re-encoded)

export interface InlinedImage {
  dataUrl: string
  width: number
  height: number
}

const MAX_WIDTH = 1200
const MAX_HEIGHT = 1600
const TIMEOUT_MS = 15000
const CONCURRENCY = 4

async function fetchOne(url: string): Promise<InlinedImage | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { mode: 'cors', signal: controller.signal })
    if (!res.ok) return null
    const blob = await res.blob()
    const bitmap = await createImageBitmap(blob)

    const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    // keep PNG for possible transparency, JPEG otherwise (smaller)
    const dataUrl = blob.type === 'image/png'
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', 0.82)
    return { dataUrl, width, height }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchImages(
  urls: string[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, InlinedImage | null>> {
  const unique = [...new Set(urls)]
  const result = new Map<string, InlinedImage | null>()
  let done = 0
  let cursor = 0

  async function worker() {
    while (cursor < unique.length) {
      const url = unique[cursor]
      cursor += 1
      result.set(url, await fetchOne(url))
      done += 1
      onProgress?.(done, unique.length)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, unique.length) }, () => worker())
  )
  return result
}
