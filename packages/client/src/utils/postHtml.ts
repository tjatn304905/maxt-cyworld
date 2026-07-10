import DOMPurify from 'dompurify'

// extract img srcs in document order — used to sync post_images on save
export function extractImageUrls(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('img'))
    .map((img) => img.getAttribute('src') ?? '')
    .filter(Boolean)
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

// legacy plain-text posts have no tags — convert newlines so they render as HTML
export function toDisplayHtml(content: string): string {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(content)
  if (looksLikeHtml) return sanitizeHtml(content)
  return sanitizeHtml(content.replace(/\n/g, '<br>'))
}
