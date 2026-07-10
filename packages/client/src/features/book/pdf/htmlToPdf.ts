import htmlToPdfmake from 'html-to-pdfmake'
import { toDisplayHtml } from '../../../utils/postHtml'
import type { InlinedImage } from './images'

// px → pt (CSS 96dpi vs PDF 72dpi)
const PX_TO_PT = 0.75
const MAX_IMAGE_HEIGHT_PT = 400

export function parsePostHtml(content: string): Document {
  const html = toDisplayHtml(content)
  return new DOMParser().parseFromString(html, 'text/html')
}

// TipTap output → html-to-pdfmake friendly markup
export function preprocessDoc(doc: Document): void {
  // 1. strip font-family everywhere — unregistered font names make pdfmake throw
  doc.body.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    el.style.removeProperty('font-family')
    if (!el.getAttribute('style')) el.removeAttribute('style')
  })

  // 2. unwrap div/figure wrappers around images (resize-extension legacy markup),
  //    keeping alignment as text-align on the surviving paragraph
  doc.body.querySelectorAll('img').forEach((img) => {
    const wrapper = img.closest('div, figure')
    if (wrapper && wrapper !== doc.body && wrapper.querySelector('img') === img) {
      const style = wrapper.getAttribute('style') ?? ''
      const justify = /justify-content:\s*(center|flex-end)/.exec(style)?.[1]
      const p = doc.createElement('p')
      if (justify) p.setAttribute('style', `text-align: ${justify === 'center' ? 'center' : 'right'}`)
      p.appendChild(img.cloneNode(true))
      wrapper.replaceWith(p)
    }
  })

  // 3. keep paragraph spacing for empty paragraphs
  doc.body.querySelectorAll('p').forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector('img')) {
      p.innerHTML = ' '
    }
  })
}

export function collectImageUrls(doc: Document): string[] {
  return Array.from(doc.body.querySelectorAll('img'))
    .map((img) => img.getAttribute('src') ?? '')
    .filter((src) => src.startsWith('http'))
}

// swap remote srcs for data URLs; drop images that failed to load
export function applyInlinedImages(
  doc: Document,
  images: Map<string, InlinedImage | null>
): number {
  let skipped = 0
  doc.body.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? ''
    if (!src.startsWith('http')) return
    const inlined = images.get(src)
    if (inlined) {
      img.setAttribute('src', inlined.dataUrl)
    } else {
      skipped += 1
      img.remove()
    }
  })
  return skipped
}

// deep-walk pdfmake nodes: size images to the page and drop stray font names
function postProcessNodes(node: any, contentWidth: number, dims: Map<string, InlinedImage>): void {
  if (Array.isArray(node)) {
    node.forEach((child) => postProcessNodes(child, contentWidth, dims))
    return
  }
  if (!node || typeof node !== 'object') return

  if (typeof node.image === 'string') {
    const inlined = dims.get(node.image)
    const naturalPt = inlined ? inlined.width * PX_TO_PT : contentWidth
    delete node.width
    delete node.height
    node.fit = [Math.min(naturalPt, contentWidth), MAX_IMAGE_HEIGHT_PT]
  }
  if (node.font && node.font !== 'Pretendard') {
    delete node.font
  }

  for (const key of ['stack', 'text', 'columns', 'ul', 'ol', 'table', 'body']) {
    if (node[key]) postProcessNodes(node[key], contentWidth, dims)
  }
}

export function convertDocToPdfNodes(
  doc: Document,
  contentWidth: number,
  images: Map<string, InlinedImage | null>
): any[] {
  const nodes = htmlToPdfmake(doc.body.innerHTML, { removeExtraBlanks: true })

  // dataUrl → dims lookup for fit calculation
  const dims = new Map<string, InlinedImage>()
  for (const inlined of images.values()) {
    if (inlined) dims.set(inlined.dataUrl, inlined)
  }

  const list = Array.isArray(nodes) ? nodes : [nodes]
  postProcessNodes(list, contentWidth, dims)
  return list
}
