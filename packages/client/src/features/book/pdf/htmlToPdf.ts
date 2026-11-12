import htmlToPdfmake from 'html-to-pdfmake'
import { toDisplayHtml } from '../../../utils/postHtml'
import { sanitizeBookText } from './bookPdf'
import type { InlinedImage } from './images'

// px → pt (CSS 96dpi vs PDF 72dpi)
const PX_TO_PT = 0.75

export { sanitizeBookText }

export function parsePostHtml(content: string): Document {
  const cleaned = sanitizeBookText(toDisplayHtml(content))
  return new DOMParser().parseFromString(cleaned, 'text/html')
}

function isSpacerText(text: string | null | undefined): boolean {
  if (!text) return true
  return text.replace(/[\s\u00A0\u200B]+/g, '') === ''
}

function extractInlinePxWidth(el: HTMLElement): number | null {
  const attrW = parseFloat(el.getAttribute('width') ?? '')
  if (!Number.isNaN(attrW) && attrW > 0) return Math.round(attrW)
  const styleAttr = el.getAttribute('style') ?? ''
  const match = styleAttr.match(/(?:^|;)\s*width\s*:\s*([\d.]+)px/i)
  if (match) {
    const val = parseFloat(match[1])
    if (!Number.isNaN(val) && val > 0) return Math.round(val)
  }
  return null
}

// TipTap / DB HTML → normalized block-level DOM preserving author layout intent
export function preprocessDoc(doc: Document): void {
  // 1. Clean text nodes
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  let currentText = walker.nextNode()
  while (currentText) {
    if (currentText.nodeValue) {
      currentText.nodeValue = sanitizeBookText(currentText.nodeValue)
    }
    currentText = walker.nextNode()
  }

  // 2. Preserve original author-intended image width before stripping fixed dimensions
  doc.body.querySelectorAll('img').forEach((img) => {
    const origW = extractInlinePxWidth(img)
    if (origW) {
      img.setAttribute('data-orig-width', String(origW))
    }
    img.removeAttribute('width')
    img.removeAttribute('height')
  })

  // 3. Detect side-by-side inline-block span label bars (e.g. "#01 선배... | #02 선배...", "1차 예선 결과 | 2차 본선 결과")
  doc.body.querySelectorAll('p').forEach((p) => {
    if (p.querySelector('img')) return
    const children = Array.from(p.children) as HTMLElement[]
    if (children.length < 2 || children.length > 4) return
    const allInlineSpans = children.every(
      (ch) =>
        ch.tagName === 'SPAN' &&
        (ch.getAttribute('style') ?? '').toLowerCase().includes('inline-block') &&
        !isSpacerText(ch.textContent)
    )
    if (allInlineSpans) {
      p.setAttribute('data-book-col-labels', '1')
    }
  })

  // 4. Detect styled callout paragraphs (background-color / border-left) so they render as clean padded editorial blocks
  doc.body.querySelectorAll('p').forEach((p) => {
    if (p.getAttribute('data-book-col-labels') === '1' || p.querySelector('img')) return
    const st = (p.getAttribute('style') ?? '').toLowerCase()
    const hasBg = st.includes('background-color')
    const hasBorder = st.includes('border-left') || st.includes('border:')
    if (!hasBg && !hasBorder) return

    const text = (p.textContent ?? '').trim()
    // Single-line "#XX 선배 ..." badges in Story 14 are section captions, not multi-line callouts
    if (/^#\d+\s/.test(text) && !p.querySelector('br') && text.length <= 95) {
      p.setAttribute('data-book-badge-caption', '1')
      p.style.removeProperty('background-color')
      p.style.removeProperty('border')
      p.style.removeProperty('border-left')
      p.style.removeProperty('padding')
      return
    }

    const tone =
      st.includes('fff1f2') || st.includes('f43f5e')
        ? 'rose'
        : st.includes('fefce8') || st.includes('f59e0b')
          ? 'amber'
          : 'slate'
    p.setAttribute('data-book-callout', tone)
    p.style.removeProperty('background-color')
    p.style.removeProperty('border')
    p.style.removeProperty('border-left')
    p.style.removeProperty('padding')
  })

  doc.body.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    el.style.removeProperty('font-family')
    if (el.tagName === 'IMG') {
      el.style.removeProperty('width')
      el.style.removeProperty('height')
      el.style.removeProperty('max-width')
      el.style.removeProperty('max-height')
    }
    if (!el.getAttribute('style')?.trim()) el.removeAttribute('style')
  })

  // 5. Unwrap single-image div/figure wrappers
  doc.body.querySelectorAll('img').forEach((img) => {
    const wrapper = img.closest('div, figure')
    if (wrapper && wrapper !== doc.body && wrapper.querySelectorAll('img').length === 1) {
      const p = doc.createElement('p')
      while (wrapper.firstChild) {
        p.appendChild(wrapper.firstChild)
      }
      wrapper.replaceWith(p)
    }
  })

  // 6. Split paragraphs that mix text and images while PRESERVING multi-image inline rows
  const topChildren = Array.from(doc.body.children)
  for (const el of topChildren) {
    const imgs = el.querySelectorAll('img')
    if (imgs.length === 0) continue

    if (el.tagName === 'TABLE' || el.tagName === 'UL' || el.tagName === 'OL') continue

    const replacementNodes: HTMLElement[] = []
    let currentP: HTMLParagraphElement | null = null
    let currentImgContainer: HTMLParagraphElement | null = null

    const flushCurrentP = () => {
      if (currentP && !isSpacerText(currentP.textContent)) {
        replacementNodes.push(currentP)
      }
      currentP = null
    }

    const flushCurrentImgContainer = () => {
      if (currentImgContainer) {
        const count = currentImgContainer.querySelectorAll('img').length
        if (count >= 2) {
          currentImgContainer.removeAttribute('data-book-img')
          currentImgContainer.setAttribute('data-book-img-row', '1')
        } else if (count === 1) {
          currentImgContainer.setAttribute('data-book-img', '1')
        }
        if (count > 0) replacementNodes.push(currentImgContainer)
      }
      currentImgContainer = null
    }

    const walkInline = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as HTMLElement
        if (elem.tagName === 'IMG') {
          flushCurrentP()
          if (!currentImgContainer) {
            currentImgContainer = doc.createElement('p')
          }
          currentImgContainer.appendChild(elem.cloneNode(true))
          return
        }
        if (elem.tagName === 'BR') {
          flushCurrentImgContainer()
          flushCurrentP()
          return
        }
        if (elem.querySelector('img')) {
          Array.from(elem.childNodes).forEach(walkInline)
          return
        }
      }

      if (node.nodeType === Node.TEXT_NODE && isSpacerText(node.textContent) && currentImgContainer) {
        return
      }

      flushCurrentImgContainer()
      if (!currentP) {
        currentP = doc.createElement('p')
        const align = (el as HTMLElement).style?.textAlign
        if (align) currentP.style.textAlign = align
      }
      currentP.appendChild(node.cloneNode(true))
    }

    Array.from(el.childNodes).forEach(walkInline)
    flushCurrentImgContainer()
    flushCurrentP()

    if (replacementNodes.length > 0) {
      el.replaceWith(...replacementNodes)
    }
  }

  // 7. Trim redundant <br> inside paragraphs and mark empty paragraphs as spacers
  Array.from(doc.body.children).forEach((el) => {
    if (
      el.getAttribute('data-book-img') === '1' ||
      el.getAttribute('data-book-img-row') === '1'
    ) {
      return
    }
    if (el.tagName === 'P' || el.tagName === 'DIV') {
      while (el.firstElementChild?.tagName === 'BR' && isSpacerText(el.firstChild?.textContent)) {
        el.firstElementChild.remove()
      }
      while (el.lastElementChild?.tagName === 'BR' && isSpacerText(el.lastChild?.textContent)) {
        el.lastElementChild.remove()
      }
      if (isSpacerText(el.textContent) && !el.querySelector('img')) {
        el.setAttribute('data-book-spacer', '1')
        el.innerHTML = ''
      }
    }
  })

  // 8. Collapse consecutive spacers and drop spacers at edges or adjacent to images/headings/dividers
  const children = Array.from(doc.body.children)
  for (let i = 0; i < children.length; i++) {
    const cur = children[i]
    if (cur.getAttribute('data-book-spacer') !== '1') continue
    const prev = children[i - 1]
    const next = children[i + 1]
    const isEdge = !prev || !next
    const isSpecial = (node: Element | undefined) =>
      Boolean(
        node &&
          (node.getAttribute('data-book-spacer') === '1' ||
            node.getAttribute('data-book-img') === '1' ||
            node.getAttribute('data-book-img-row') === '1' ||
            node.getAttribute('data-book-col-labels') === '1' ||
            node.tagName === 'HR' ||
            /^H[1-6]$/.test(node.tagName))
      )

    if (isEdge || isSpecial(prev) || isSpecial(next)) {
      cur.remove()
      children.splice(i, 1)
      i -= 1
    }
  }
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
      const parent = img.parentElement
      img.remove()
      if (parent && parent !== doc.body) {
        const remainingImgs = parent.querySelectorAll('img').length
        if (remainingImgs === 1 && parent.getAttribute('data-book-img-row') === '1') {
          parent.removeAttribute('data-book-img-row')
          parent.setAttribute('data-book-img', '1')
        } else if (remainingImgs === 0 && isSpacerText(parent.textContent)) {
          parent.remove()
        }
      }
    }
  })
  return skipped
}

interface ImageToken {
  kind: 'image'
  dataUrl: string
  widthPt: number
  heightPt: number
  aspect: number
  origWidth: number | null
}

interface ImageRowToken {
  kind: 'image-row'
  images: ImageToken[]
}

interface ColLabelsToken {
  kind: 'col-labels'
  labels: string[]
}

interface DividerToken {
  kind: 'divider'
}

interface TextToken {
  kind: 'text'
  plainText: string
  isTopCaptionCandidate: boolean
  isBottomCaptionCandidate: boolean
  isSubNoteCandidate: boolean
  isSectionHeader: boolean
  isHeading: boolean
  pdfNodes: any[]
}

interface SpacerToken {
  kind: 'spacer'
}

type RawToken =
  | ImageToken
  | ImageRowToken
  | ColLabelsToken
  | DividerToken
  | TextToken
  | SpacerToken

interface FigureBlock {
  kind: 'figure'
  image: ImageToken
  topCaption: string | null
  topSubCaption: string | null
  bottomCaption: string | null
}

interface ImageRowBlock {
  kind: 'image-row-block'
  rows: ImageToken[][]
  colCaptions: string[] | null
  topCaption: string | null
  bottomCaption: string | null
}

type EditorialItem = FigureBlock | ImageRowBlock | TextToken | DividerToken | SpacerToken

function classifyTextParagraph(el: HTMLElement, plainText: string): {
  isTopCaptionCandidate: boolean
  isBottomCaptionCandidate: boolean
  isSubNoteCandidate: boolean
  isSectionHeader: boolean
} {
  const trimmed = plainText.trim()
  if (!trimmed || el.tagName === 'TABLE' || el.tagName === 'UL' || el.tagName === 'OL') {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
      isSectionHeader: false,
    }
  }

  // 1. Bottom narrative captions: "▲..." or "소감: ..." placed immediately beneath photos
  if (
    (/^[▲△▼▽]\s*\S+/.test(trimmed) || /^소감\s*:/.test(trimmed)) &&
    trimmed.length <= 260
  ) {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: true,
      isSubNoteCandidate: false,
      isSectionHeader: false,
    }
  }

  // 2. Parenthetical sub-notes: "(각 팀 MVP는 대표 1명만 선정했으나...)"
  if (/^\([^()]+\)$/.test(trimmed) && trimmed.length <= 130) {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: true,
      isSectionHeader: false,
    }
  }

  // 3. Explicit top captions / section titles:
  //    <...>, [...], 【...】, #01 ..., 1. ..., ♥ 1> ..., ♥ 1조 ..., or badge captions
  const isBracketOrNumberedSection =
    (/^<[^<>]+>/.test(trimmed) ||
      /^\[[^[\]]+\]/.test(trimmed) ||
      /^【[^【】]+】/.test(trimmed) ||
      /^#\d+\s+\S+/.test(trimmed) ||
      /^[★☆♥♡♪♬※]?\s*\d+\s*(?:[.)>번]|조)\s*\S*/.test(trimmed) ||
      el.getAttribute('data-book-badge-caption') === '1') &&
    trimmed.length <= 95

  if (isBracketOrNumberedSection) {
    return {
      isTopCaptionCandidate: true,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
      isSectionHeader: true,
    }
  }

  const hasBr = el.querySelector('br') !== null
  const onlyBoldChild =
    el.children.length === 1 &&
    (el.firstElementChild?.tagName === 'STRONG' || el.firstElementChild?.tagName === 'B') &&
    el.firstElementChild.textContent?.trim() === trimmed
  const isCentered = el.style?.textAlign === 'center'

  if (!hasBr && trimmed.length <= 68 && (onlyBoldChild || isCentered)) {
    return {
      isTopCaptionCandidate: true,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
      isSectionHeader: onlyBoldChild,
    }
  }

  // Short single-line plain text lead-ins (e.g. "제보 받아요!!", "사진 제보하면 안잡아먹지~~", "볼링 2차 본선 결과 >> ...")
  const isListBullet = /^[•·\-*]\s/.test(trimmed)
  const isSeparatorLine = /^[-=_~]{5,}/.test(trimmed)
  if (!hasBr && !isListBullet && !isSeparatorLine && trimmed.length <= 42) {
    return {
      isTopCaptionCandidate: true,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
      isSectionHeader: false,
    }
  }

  return {
    isTopCaptionCandidate: false,
    isBottomCaptionCandidate: false,
    isSubNoteCandidate: false,
    isSectionHeader: false,
  }
}

function fitDimensions(
  img: ImageToken,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const w = Math.max(1, img.widthPt)
  const h = Math.max(1, img.heightPt)
  const scale = Math.min(1, maxWidth / w, maxHeight / h)
  return {
    width: Math.round(w * scale * 10) / 10,
    height: Math.round(h * scale * 10) / 10,
  }
}

const COMPACT_MATRIX_TABLE_LAYOUT = {
  hLineWidth: () => 0.4,
  vLineWidth: () => 0.4,
  hLineColor: () => '#CBD5E1',
  vLineColor: () => '#CBD5E1',
  paddingLeft: () => 2,
  paddingRight: () => 2,
  paddingTop: () => 2.5,
  paddingBottom: () => 2.5,
}

// deep-walk pdfmake nodes: size any inline images, normalize wide HTML tables, and drop stray font names
function postProcessNodes(
  node: any,
  contentWidth: number,
  dims: Map<string, InlinedImage>,
  isA4: boolean
): void {
  if (Array.isArray(node)) {
    node.forEach((child) => postProcessNodes(child, contentWidth, dims, isA4))
    return
  }
  if (!node || typeof node !== 'object') return

  if (typeof node.image === 'string') {
    const inlined = dims.get(node.image)
    const naturalPt = inlined ? inlined.width * PX_TO_PT : contentWidth
    delete node.width
    delete node.height
    const maxH = isA4 ? 255 : 185
    node.fit = [Math.min(naturalPt, contentWidth), maxH]
    node.alignment = 'center'
  }
  if (node.font && node.font !== 'Pretendard') {
    delete node.font
  }

  // Ensure multi-column HTML tables (like the 12-col matrix in Story 14) fit cleanly inside A5/A4 margins
  if (node.table && Array.isArray(node.table.body) && node.table.body.length > 0) {
    const colCount = Array.isArray(node.table.body[0]) ? node.table.body[0].length : 0
    if (colCount >= 6) {
      node.table.dontBreakRows = true
      node.table.widths = ['auto', ...Array(Math.max(0, colCount - 2)).fill('*'), 'auto']
      node.layout = COMPACT_MATRIX_TABLE_LAYOUT
      node.fontSize = isA4 ? 7.2 : 6.2
      node.margin = [0, 4, 0, 8]
    }
  }

  for (const key of ['stack', 'text', 'columns', 'ul', 'ol', 'table', 'body']) {
    if (node[key]) postProcessNodes(node[key], contentWidth, dims, isA4)
  }
}

function createCalloutLayout(accentColor: string) {
  return {
    hLineWidth: () => 0,
    vLineWidth: (i: number) => (i === 0 ? 2.2 : 0),
    vLineColor: () => accentColor,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 5,
    paddingBottom: () => 5,
  }
}

function convertElementToNodes(
  el: HTMLElement,
  contentWidth: number,
  dims: Map<string, InlinedImage>,
  isA4: boolean
): any[] {
  const calloutTone = el.getAttribute('data-book-callout')
  const wrapper = el.ownerDocument.createElement('div')
  wrapper.appendChild(el.cloneNode(true))
  const raw = htmlToPdfmake(wrapper.innerHTML, {
    removeExtraBlanks: true,
    defaultStyles: {
      p: { margin: [0, 0, 0, isA4 ? 4.5 : 3.5] },
      h1: { fontSize: isA4 ? 13.5 : 12, bold: true, color: '#142834', margin: [0, 7, 0, 3.5] },
      h2: { fontSize: isA4 ? 12.5 : 11, bold: true, color: '#142834', margin: [0, 6, 0, 3] },
      h3: { fontSize: isA4 ? 11.5 : 10.2, bold: true, color: '#1E3A4C', margin: [0, 5, 0, 2.5] },
      h4: { fontSize: isA4 ? 10.5 : 9.5, bold: true, color: '#1E3A4C', margin: [0, 4, 0, 2] },
      ul: { margin: [0, 2, 0, 4] },
      ol: { margin: [0, 2, 0, 4] },
      blockquote: { italics: true, color: '#4A6070', margin: [8, 3, 0, 4] },
    },
  })
  const list = Array.isArray(raw) ? raw : [raw]
  postProcessNodes(list, contentWidth, dims, isA4)

  if (calloutTone && list.length > 0) {
    const bg =
      calloutTone === 'rose' ? '#FFF1F2' : calloutTone === 'amber' ? '#FEFCE8' : '#F8FAFC'
    const border =
      calloutTone === 'rose' ? '#F43F5E' : calloutTone === 'amber' ? '#F59E0B' : '#298EB5'
    return [
      {
        table: {
          dontBreakRows: true,
          widths: ['*'],
          body: [[{ stack: list, fillColor: bg }]],
        },
        layout: createCalloutLayout(border),
        margin: [0, 3, 0, 6],
      },
    ]
  }

  return list
}

function buildTopCaptionNode(text: string, isA4: boolean, align: 'left' | 'center' = 'left'): any {
  return {
    text,
    fontSize: isA4 ? 9.8 : 9,
    bold: true,
    color: '#142834',
    alignment: align,
    lineHeight: 1.35,
    margin: [0, 2, 0, 5],
  }
}

function buildSubCaptionNode(text: string, isA4: boolean, align: 'left' | 'center' = 'left'): any {
  return {
    text,
    fontSize: isA4 ? 8.6 : 7.9,
    color: '#475569',
    alignment: align,
    lineHeight: 1.38,
    margin: [0, 0, 0, 4.5],
  }
}

// Editorial book description placed beneath a photo or photo group (like a real photo-book)
function buildBottomCaptionNode(text: string, isA4: boolean): any {
  const cleaned = text.replace(/^[▲△▼▽]\s*/, '').trim()
  const isLongNarrative = cleaned.length > 36
  return {
    text: cleaned,
    fontSize: isA4 ? 9.2 : 8.4,
    color: '#334155',
    alignment: isLongNarrative ? 'left' : 'center',
    lineHeight: 1.48,
    margin: [isLongNarrative ? 4 : 0, 5.5, isLongNarrative ? 4 : 0, 2],
  }
}

// Render a single figure as a generous book plate (no artificial border box)
function buildBorderlessFigureNode(
  fig: FigureBlock,
  contentWidth: number,
  isA4: boolean,
  isOnlyImageInChapter: boolean,
  hasLongFollowingProse = false
): any {
  const origW = fig.image.origWidth
  const aspect = fig.image.aspect

  // Only tiny square/portrait stickers or memes (width <= 195 and aspect <= 1.05) stay compact
  const isCompactSticker = origW !== null && origW <= 195 && aspect <= 1.05
  const isPortraitPlate = aspect < 0.92 && !isCompactSticker

  const maxImgW = isCompactSticker
    ? isA4
      ? 210
      : 155
    : isPortraitPlate
      ? isA4
        ? 330
        : 240
      : contentWidth

  let maxImgH: number
  if (isOnlyImageInChapter) {
    maxImgH = isA4 ? 320 : 230
  } else if (isCompactSticker) {
    maxImgH = isA4 ? 185 : 134
  } else if (hasLongFollowingProse) {
    // 1-per-page "Photo + Long Story" book plate (e.g. 친해지길 바라 group features, Adieu 2025 essays)
    maxImgH = isPortraitPlate ? (isA4 ? 250 : 178) : isA4 ? 258 : 184
  } else if (isPortraitPlate) {
    maxImgH = isA4 ? 208 : 148
  } else {
    // Balanced full-width photo plate + 1~2 line description:
    // ~152pt on A5 (~214pt on A4) so 2 full-width plates + descriptions always fit on a single page!
    maxImgH = isA4 ? 214 : 152
  }

  const fitted = fitDimensions(fig.image, maxImgW, maxImgH)
  const stack: any[] = []

  if (fig.topCaption) {
    stack.push(buildTopCaptionNode(fig.topCaption, isA4, 'left'))
  }
  if (fig.topSubCaption) {
    stack.push(buildSubCaptionNode(fig.topSubCaption, isA4, 'left'))
  }

  stack.push({
    image: fig.image.dataUrl,
    fit: [fitted.width, fitted.height],
    alignment: 'center',
  })

  if (fig.bottomCaption) {
    stack.push(buildBottomCaptionNode(fig.bottomCaption, isA4))
  }

  return {
    stack,
    unbreakable: true,
    margin: [0, 3, 0, hasLongFollowingProse ? 8.5 : 6.5],
  }
}

// Render 2 or 3 consecutive portrait/compact FigureBlocks side-by-side in equal-height columns
function buildMultiColumnFiguresRow(
  figures: FigureBlock[],
  contentWidth: number,
  isA4: boolean
): any {
  const count = figures.length
  const gap = isA4 ? 12 : 8
  const colWidth = (contentWidth - gap * (count - 1)) / count
  const maxGridImgH = count >= 3 ? (isA4 ? 135 : 96) : isA4 ? 195 : 140

  const fittedList = figures.map((f) => fitDimensions(f.image, colWidth, maxGridImgH))
  const sharedViewportH = Math.max(...fittedList.map((d) => d.height))

  const columns = figures.map((fig, i) => {
    const fitted = fittedList[i]
    const padTop = Math.max(0, Math.round((sharedViewportH - fitted.height) / 2))
    const padBot = Math.max(0, Math.round(sharedViewportH - fitted.height - padTop))
    const colStack: any[] = []

    if (fig.topCaption) {
      colStack.push({
        text: fig.topCaption,
        fontSize: isA4 ? 8.8 : 8,
        bold: true,
        color: '#142834',
        alignment: 'left',
        lineHeight: 1.32,
        margin: [0, 0, 0, 3.5],
      })
    }
    if (fig.topSubCaption) {
      colStack.push({
        text: fig.topSubCaption,
        fontSize: isA4 ? 8 : 7.3,
        color: '#475569',
        alignment: 'left',
        lineHeight: 1.32,
        margin: [0, 0, 0, 3.5],
      })
    }

    colStack.push({
      image: fig.image.dataUrl,
      fit: [fitted.width, fitted.height],
      alignment: 'center',
      margin: [0, padTop, 0, padBot],
    })

    if (fig.bottomCaption) {
      colStack.push({
        text: fig.bottomCaption.replace(/^[▲△▼▽]\s*/, '').trim(),
        fontSize: isA4 ? 8.2 : 7.5,
        color: '#334155',
        alignment: 'center',
        lineHeight: 1.38,
        margin: [2, 4, 2, 0],
      })
    }

    return {
      width: colWidth,
      stack: colStack,
    }
  })

  return {
    columns,
    columnGap: gap,
    unbreakable: true,
    margin: [0, 4, 0, 9],
  }
}

// Render a multi-image plate (1-row 2-up/3-up or 2-row 2x2/3x2 collage) with aspect-proportional widths
function buildImageRowBlockNode(
  block: ImageRowBlock,
  contentWidth: number,
  isA4: boolean,
  isVeryDenseAlbum: boolean
): any {
  const stack: any[] = []
  const isMultiRowGroup = block.rows.length >= 2

  if (block.topCaption) {
    stack.push(buildTopCaptionNode(block.topCaption, isA4, 'left'))
  }

  block.rows.forEach((rowImages, rowIdx) => {
    const count = rowImages.length
    const gap = isA4 ? 9 : 6.5
    const availableW = contentWidth - gap * (count - 1)
    const hasColCaptions = Boolean(rowIdx === 0 && block.colCaptions && block.colCaptions.length >= 2)

    const maxRowH =
      count >= 3
        ? isA4
          ? 140
          : 98
        : isMultiRowGroup
          ? isA4
            ? 168
            : 118
          : isVeryDenseAlbum
            ? isA4
              ? 155
              : 108
            : isA4
              ? 210
              : 148

    // When there are no separate column headers (colCaptions), allocate column widths
    // proportionally to each photo's aspect ratio so mixed portrait + landscape photos
    // share the exact same height and span the full width cleanly!
    if (!hasColCaptions && count >= 2) {
      const clampedAspects = rowImages.map((img) => Math.max(0.45, Math.min(2.85, img.aspect)))
      const sumAspects = clampedAspects.reduce((a, b) => a + b, 0)
      const naturalMinH = Math.min(...rowImages.map((img) => Math.max(1, img.heightPt)))
      const targetH = Math.min(maxRowH, naturalMinH, availableW / sumAspects)

      const colWidths = clampedAspects.map(
        (asp) => Math.round((availableW * (asp / sumAspects)) * 10) / 10
      )
      const fittedList = rowImages.map((img, colIdx) =>
        fitDimensions(img, colWidths[colIdx], targetH)
      )
      const sharedH = Math.max(...fittedList.map((d) => d.height))

      const cols = rowImages.map((img, colIdx) => {
        const fitted = fittedList[colIdx]
        const padTop = Math.max(0, Math.round((sharedH - fitted.height) / 2))
        const padBot = Math.max(0, Math.round(sharedH - fitted.height - padTop))
        return {
          width: colWidths[colIdx],
          stack: [
            {
              image: img.dataUrl,
              fit: [fitted.width, fitted.height],
              alignment: 'center',
              margin: [0, padTop, 0, padBot],
            },
          ],
        }
      })

      stack.push({
        columns: cols,
        columnGap: gap,
        margin: [0, rowIdx > 0 ? 5 : 0, 0, 0],
      })
      return
    }

    // Equal-width columns when explicit column labels (#01 ... | #02 ...) are present above each column
    const colWidth = availableW / count
    const fittedList = rowImages.map((img) => fitDimensions(img, colWidth, maxRowH))
    const sharedH = Math.max(...fittedList.map((d) => d.height))

    const cols = rowImages.map((img, colIdx) => {
      const fitted = fittedList[colIdx]
      const padTop = Math.max(0, Math.round((sharedH - fitted.height) / 2))
      const padBot = Math.max(0, Math.round(sharedH - fitted.height - padTop))
      const colStack: any[] = []

      const colLabel =
        rowIdx === 0 && block.colCaptions && block.colCaptions[colIdx]
          ? block.colCaptions[colIdx]
          : null

      if (colLabel) {
        colStack.push({
          text: colLabel,
          fontSize: isA4 ? 8.4 : 7.6,
          bold: true,
          color: '#142834',
          alignment: 'left',
          lineHeight: 1.32,
          margin: [0, 0, 0, 3.5],
        })
      }

      colStack.push({
        image: img.dataUrl,
        fit: [fitted.width, fitted.height],
        alignment: 'center',
        margin: [0, padTop, 0, padBot],
      })

      return {
        width: colWidth,
        stack: colStack,
      }
    })

    stack.push({
      columns: cols,
      columnGap: gap,
      margin: [0, rowIdx > 0 ? 5 : 0, 0, 0],
    })
  })

  if (block.bottomCaption) {
    stack.push(buildBottomCaptionNode(block.bottomCaption, isA4))
  }

  return {
    stack,
    unbreakable: true,
    margin: [0, 4, 0, isVeryDenseAlbum ? 6.5 : 9],
  }
}

function buildImageToken(
  img: HTMLImageElement,
  dims: Map<string, InlinedImage>,
  contentWidth: number
): ImageToken | null {
  const src = img.getAttribute('src') ?? ''
  if (!src) return null
  const inlined = dims.get(src)
  const origWAttr = parseFloat(img.getAttribute('data-orig-width') ?? '')
  const origWidth = !Number.isNaN(origWAttr) && origWAttr > 0 ? origWAttr : null
  const widthPt = inlined ? inlined.width * PX_TO_PT : contentWidth * 0.85
  const heightPt = inlined ? inlined.height * PX_TO_PT : contentWidth * 0.65
  return {
    kind: 'image',
    dataUrl: src,
    widthPt,
    heightPt,
    aspect: widthPt / Math.max(1, heightPt),
    origWidth,
  }
}

export function convertDocToPdfNodes(
  doc: Document,
  contentWidth: number,
  images: Map<string, InlinedImage | null>
): any[] {
  const isA4 = contentWidth > 400

  // dataUrl → dims lookup for fit calculation
  const dims = new Map<string, InlinedImage>()
  for (const inlined of images.values()) {
    if (inlined) dims.set(inlined.dataUrl, inlined)
  }

  // 1. Tokenize top-level DOM elements into semantic blocks
  const rawTokens: RawToken[] = []
  const children = Array.from(doc.body.children) as HTMLElement[]

  if (children.length === 0 && !isSpacerText(doc.body.textContent)) {
    const p = doc.createElement('p')
    p.textContent = doc.body.textContent
    children.push(p)
  }

  for (const el of children) {
    if (el.getAttribute('data-book-spacer') === '1') {
      rawTokens.push({ kind: 'spacer' })
      continue
    }

    if (el.tagName === 'HR') {
      rawTokens.push({ kind: 'divider' })
      continue
    }

    if (el.getAttribute('data-book-col-labels') === '1') {
      const labels = Array.from(el.children)
        .map((sp) => (sp.textContent ?? '').trim())
        .filter(Boolean)
      if (labels.length >= 2) {
        rawTokens.push({ kind: 'col-labels', labels })
        continue
      }
    }

    if (el.getAttribute('data-book-img-row') === '1') {
      const rowImgs = Array.from(el.querySelectorAll('img'))
        .map((img) => buildImageToken(img, dims, contentWidth))
        .filter((t): t is ImageToken => t !== null)

      if (rowImgs.length >= 2) {
        const prevToken = rawTokens[rawTokens.length - 1]
        const hasPrecedingColLabels = prevToken?.kind === 'col-labels'
        // Unpack wide composite slides (aspect >= 1.42) that were only placed inline for wide web screens
        const allWideCompositeSlides =
          !hasPrecedingColLabels &&
          rowImgs.every((img) => img.aspect >= 1.42 && (img.origWidth ?? 999) >= 215)

        if (allWideCompositeSlides) {
          rowImgs.forEach((img) => rawTokens.push(img))
        } else {
          rawTokens.push({ kind: 'image-row', images: rowImgs })
        }
        continue
      }
      if (rowImgs.length === 1) {
        rawTokens.push(rowImgs[0])
        continue
      }
    }

    if (el.getAttribute('data-book-img') === '1') {
      const img = el.querySelector('img')
      const token = img ? buildImageToken(img, dims, contentWidth) : null
      if (token) rawTokens.push(token)
      continue
    }

    const plainText = (el.textContent ?? '').trim()
    if (!plainText && !el.querySelector('img')) continue

    // Convert text-based dashed separator lines (e.g. "---- 절취선 ----") into clean dividers
    if (/^[-=_~]{5,}\s*(?:절취선)?\s*[-=_~]*$/.test(plainText)) {
      rawTokens.push({ kind: 'divider' })
      continue
    }

    const {
      isTopCaptionCandidate,
      isBottomCaptionCandidate,
      isSubNoteCandidate,
      isSectionHeader,
    } = classifyTextParagraph(el, plainText)
    const isHeading = /^H[1-6]$/.test(el.tagName)
    const pdfNodes = convertElementToNodes(el, contentWidth, dims, isA4)

    if (pdfNodes.length > 0) {
      rawTokens.push({
        kind: 'text',
        plainText,
        isTopCaptionCandidate,
        isBottomCaptionCandidate,
        isSubNoteCandidate,
        isSectionHeader,
        isHeading,
        pdfNodes,
      })
    }
  }

  const totalImages = rawTokens.reduce((sum, t) => {
    if (t.kind === 'image') return sum + 1
    if (t.kind === 'image-row') return sum + t.images.length
    return sum
  }, 0)
  const isOnlyImageInChapter = totalImages === 1
  const isVeryDenseAlbum = totalImages >= 25

  // 2. Pair captions, column labels, sub-notes, and bottom captions with adjacent images/rows
  const editorialItems: EditorialItem[] = []
  let idx = 0

  while (idx < rawTokens.length) {
    const cur = rawTokens[idx]
    const next = rawTokens[idx + 1]
    const next2 = rawTokens[idx + 2]

    // Pattern 1: [ColLabels ("#01 ... | #02 ...")] -> [ImageRow]
    if (cur.kind === 'col-labels' && next?.kind === 'image-row') {
      const rows: ImageToken[][] = [next.images]
      let step = 2
      if (
        rawTokens[idx + step]?.kind === 'text' &&
        (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate
      ) {
        const bot = (rawTokens[idx + step] as TextToken).plainText
        editorialItems.push({
          kind: 'image-row-block',
          rows,
          colCaptions: cur.labels,
          topCaption: null,
          bottomCaption: bot,
        })
        idx += step + 1
        continue
      }
      editorialItems.push({
        kind: 'image-row-block',
        rows,
        colCaptions: cur.labels,
        topCaption: null,
        bottomCaption: null,
      })
      idx += step
      continue
    }

    // Pattern 2: [TopCaption ("3. 족구" / "💛 1조")] -> [ImageRow] (+ optional 2nd ImageRow) (+ optional BottomCaption)
    if (cur.kind === 'text' && cur.isTopCaptionCandidate && next?.kind === 'image-row') {
      const rows: ImageToken[][] = [next.images]
      let step = 2
      if (rawTokens[idx + step]?.kind === 'image-row') {
        rows.push((rawTokens[idx + step] as ImageRowToken).images)
        step += 1
      }
      let bottomCaption: string | null = null
      if (
        rawTokens[idx + step]?.kind === 'text' &&
        (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate
      ) {
        bottomCaption = (rawTokens[idx + step] as TextToken).plainText
        step += 1
      }
      editorialItems.push({
        kind: 'image-row-block',
        rows,
        colCaptions: null,
        topCaption: cur.plainText,
        bottomCaption,
      })
      idx += step
      continue
    }

    // Pattern 3: Standalone [ImageRow] (+ optional 2nd ImageRow) (+ optional BottomCaption)
    if (cur.kind === 'image-row') {
      const rows: ImageToken[][] = [cur.images]
      let step = 1
      if (rawTokens[idx + step]?.kind === 'image-row') {
        rows.push((rawTokens[idx + step] as ImageRowToken).images)
        step += 1
      }
      let bottomCaption: string | null = null
      if (
        rawTokens[idx + step]?.kind === 'text' &&
        (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate
      ) {
        bottomCaption = (rawTokens[idx + step] as TextToken).plainText
        step += 1
      }
      editorialItems.push({
        kind: 'image-row-block',
        rows,
        colCaptions: null,
        topCaption: null,
        bottomCaption,
      })
      idx += step
      continue
    }

    // Pattern 4: [TopCaption] -> [SubNote ("(각 팀 MVP는...)")] -> [Single Image] (+ optional BottomCaption)
    if (
      cur.kind === 'text' &&
      cur.isTopCaptionCandidate &&
      next?.kind === 'text' &&
      next.isSubNoteCandidate &&
      next2?.kind === 'image'
    ) {
      let step = 3
      let bottomCaption: string | null = null
      if (
        rawTokens[idx + step]?.kind === 'text' &&
        (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate
      ) {
        bottomCaption = (rawTokens[idx + step] as TextToken).plainText
        step += 1
      }
      editorialItems.push({
        kind: 'figure',
        image: next2,
        topCaption: cur.plainText,
        topSubCaption: next.plainText,
        bottomCaption,
      })
      idx += step
      continue
    }

    // Pattern 5: [TopCaption] -> [Single Image] (+ optional BottomCaption)
    if (cur.kind === 'text' && cur.isTopCaptionCandidate && next?.kind === 'image') {
      let step = 2
      let bottomCaption: string | null = null
      if (
        rawTokens[idx + step]?.kind === 'text' &&
        (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate
      ) {
        bottomCaption = (rawTokens[idx + step] as TextToken).plainText
        step += 1
      }
      editorialItems.push({
        kind: 'figure',
        image: next,
        topCaption: cur.plainText,
        topSubCaption: null,
        bottomCaption,
      })
      idx += step
      continue
    }

    // Pattern 6: [Single Image] (+ optional BottomCaption)
    if (cur.kind === 'image') {
      let step = 1
      let bottomCaption: string | null = null
      if (next?.kind === 'text' && next.isBottomCaptionCandidate) {
        bottomCaption = next.plainText
        step += 1
      }
      editorialItems.push({
        kind: 'figure',
        image: cur,
        topCaption: null,
        topSubCaption: null,
        bottomCaption,
      })
      idx += step
      continue
    }

    // Fallback for standalone ColLabels
    if (cur.kind === 'col-labels') {
      editorialItems.push({
        kind: 'text',
        plainText: cur.labels.join('   |   '),
        isTopCaptionCandidate: false,
        isBottomCaptionCandidate: false,
        isSubNoteCandidate: false,
        isSectionHeader: false,
        isHeading: false,
        pdfNodes: [
          {
            columns: cur.labels.map((lbl) => ({
              width: '*',
              text: lbl,
              fontSize: isA4 ? 8.4 : 7.6,
              bold: true,
              color: '#142834',
            })),
            columnGap: 8,
            margin: [0, 3, 0, 3],
          },
        ],
      })
      idx += 1
      continue
    }

    editorialItems.push(cur)
    idx += 1
  }

  // Drop spacers adjacent to figures/image-rows/dividers so vertical rhythm stays tight
  const cleanedItems = editorialItems.filter((item, i, arr) => {
    if (item.kind !== 'spacer') return true
    const prev = arr[i - 1]
    const next = arr[i + 1]
    if (!prev || !next) return false
    if (
      prev.kind === 'figure' ||
      prev.kind === 'image-row-block' ||
      prev.kind === 'divider' ||
      next.kind === 'figure' ||
      next.kind === 'image-row-block' ||
      next.kind === 'divider'
    ) {
      return false
    }
    return true
  })

  // Helper: collect narrative prose paragraphs that immediately follow a photo/photo-group
  // and belong to the same section (i.e. NOT starting a new section header or divider).
  const collectFollowingSectionProse = (
    startIndex: number
  ): { nodes: any[]; count: number; totalChars: number } => {
    const proseNodes: any[] = []
    let k = startIndex
    let totalChars = 0

    while (k < cleanedItems.length) {
      const candidate = cleanedItems[k]
      if (candidate.kind === 'spacer') {
        k += 1
        continue
      }
      if (candidate.kind !== 'text') break
      // Stop if this text paragraph is a new section header (e.g. "💛 2조...", "1. 볼링", "[경기 스케치]")
      if (candidate.isSectionHeader || candidate.isHeading || candidate.isTopCaptionCandidate) {
        break
      }
      // If a single block is huge (> 360 chars, e.g. Story 12 2조's 50 commonalities box) and we already
      // attached the first narrative paragraph, leave the huge box outside the unbreakable stack so it flows naturally.
      if (proseNodes.length > 0 && totalChars + candidate.plainText.length > 380) {
        break
      }
      if (proseNodes.length === 0 && candidate.plainText.length > 520) {
        break
      }

      proseNodes.push(...candidate.pdfNodes)
      totalChars += candidate.plainText.length
      k += 1

      if (totalChars >= 340) break
    }

    return { nodes: proseNodes, count: k - startIndex, totalChars }
  }

  // 3. Compose Editorial Book Nodes ("Photo(s) + Description" book layout)
  const outputNodes: any[] = []
  let p = 0

  while (p < cleanedItems.length) {
    const item = cleanedItems[p]

    if (item.kind === 'spacer') {
      outputNodes.push({ text: '', margin: [0, 1.5, 0, 1.5] })
      p += 1
      continue
    }

    if (item.kind === 'divider') {
      outputNodes.push({
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: contentWidth,
            y2: 0,
            lineWidth: 0.5,
            dash: { length: 3, space: 2 },
            lineColor: '#CBD5E1',
          },
        ],
        margin: [0, 6, 0, 7],
      })
      p += 1
      continue
    }

    // Multi-Photo Plate + Following Narrative Description ("사진 여러장 + 설명")
    if (item.kind === 'image-row-block') {
      const plateNode = buildImageRowBlockNode(item, contentWidth, isA4, isVeryDenseAlbum)
      const following = collectFollowingSectionProse(p + 1)

      if (following.nodes.length > 0) {
        outputNodes.push({
          stack: [plateNode, ...following.nodes],
          unbreakable: true,
          margin: [0, 3, 0, 8],
        })
        p += 1 + following.count
        continue
      }

      outputNodes.push(plateNode)
      p += 1
      continue
    }

    // Text blocks (when text precedes photos or stands alone)
    if (item.kind === 'text') {
      const textRun: Array<TextToken | SpacerToken> = [item]
      let look = p + 1
      while (
        look < cleanedItems.length &&
        (cleanedItems[look].kind === 'text' || cleanedItems[look].kind === 'spacer')
      ) {
        textRun.push(cleanedItems[look] as TextToken | SpacerToken)
        look += 1
      }

      const followingItem = cleanedItems[look]
      const textOnly = textRun.filter((t): t is TextToken => t.kind === 'text')
      const totalChars = textOnly.reduce((sum, t) => sum + t.plainText.length, 0)

      const isAttachableFigure =
        followingItem?.kind === 'figure' &&
        !followingItem.topCaption &&
        cleanedItems[look + 1]?.kind !== 'figure'
      const isAttachableRow =
        followingItem?.kind === 'image-row-block' && !followingItem.topCaption

      if (
        (isAttachableFigure || isAttachableRow) &&
        textOnly.length >= 1 &&
        textOnly.length <= 8 &&
        totalChars <= 320
      ) {
        const sectionStack: any[] = []
        for (const t of textRun) {
          if (t.kind === 'spacer') sectionStack.push({ text: '', margin: [0, 1.5, 0, 1.5] })
          else sectionStack.push(...t.pdfNodes)
        }
        sectionStack.push(
          followingItem.kind === 'figure'
            ? buildBorderlessFigureNode(followingItem, contentWidth, isA4, isOnlyImageInChapter)
            : buildImageRowBlockNode(followingItem, contentWidth, isA4, isVeryDenseAlbum)
        )
        outputNodes.push({
          stack: sectionStack,
          unbreakable: true,
          margin: [0, 3, 0, 8],
        })
        p = look + 1
        continue
      }

      // Keep a single section header (e.g. "1. 반백요리사 요리왕 대결", "[경기 스케치 - 1부]")
      // attached to the very first photo plate below it so a heading is never orphaned at page bottom!
      if (
        textOnly.length === 1 &&
        totalChars <= 75 &&
        (followingItem?.kind === 'figure' || followingItem?.kind === 'image-row-block')
      ) {
        if (followingItem.kind === 'image-row-block') {
          const plateNode = buildImageRowBlockNode(
            followingItem,
            contentWidth,
            isA4,
            isVeryDenseAlbum
          )
          const afterRowProse = collectFollowingSectionProse(look + 1)
          outputNodes.push({
            stack: [...textOnly[0].pdfNodes, plateNode, ...afterRowProse.nodes],
            unbreakable: true,
            margin: [0, 4, 0, 8],
          })
          p = look + 1 + afterRowProse.count
          continue
        }

        // Following item is a FigureBlock: bind the heading with the first FigureBlock (+ its following prose if any)
        const afterFigProse = collectFollowingSectionProse(look + 1)
        const firstPlate = buildBorderlessFigureNode(
          followingItem,
          contentWidth,
          isA4,
          isOnlyImageInChapter,
          afterFigProse.totalChars >= 95
        )
        outputNodes.push({
          stack: [...textOnly[0].pdfNodes, firstPlate, ...afterFigProse.nodes],
          unbreakable: true,
          margin: [0, 3, 0, 6.5],
        })
        p = look + 1 + afterFigProse.count
        continue
      }

      outputNodes.push(...item.pdfNodes)
      p += 1
      continue
    }

    if (item.kind === 'figure') {
      const nextItem = cleanedItems[p + 1]

      // Special Pattern: Wide Banner/Strip Image (e.g. Workshop Banner or Roulette Table Strip)
      // immediately followed by a Main Photo + Description (e.g. Story 1 Opening or Story 1 Finale MVP)
      if (
        nextItem?.kind === 'figure' &&
        !nextItem.topCaption &&
        item.image.aspect >= 1.65 &&
        !item.bottomCaption
      ) {
        const bannerFitted = fitDimensions(
          item.image,
          contentWidth,
          isA4 ? 145 : 102
        )
        const followingProse = collectFollowingSectionProse(p + 2)
        const secondPlate = buildBorderlessFigureNode(
          nextItem,
          contentWidth,
          isA4,
          false,
          followingProse.totalChars >= 95
        )
        const combinedStack: any[] = []
        if (item.topCaption) {
          combinedStack.push(buildTopCaptionNode(item.topCaption, isA4, 'left'))
        }
        combinedStack.push({
          image: item.image.dataUrl,
          fit: [bannerFitted.width, bannerFitted.height],
          alignment: 'center',
          margin: [0, 0, 0, 6],
        })
        combinedStack.push(secondPlate)
        combinedStack.push(...followingProse.nodes)

        outputNodes.push({
          stack: combinedStack,
          unbreakable: true,
          margin: [0, 4, 0, 8],
        })
        p += 2 + followingProse.count
        continue
      }

      // Check for a run of compact vertical/portrait figures (e.g. the three 150px memes in Story 13)
      const figureRun: FigureBlock[] = [item]
      while (cleanedItems[p + figureRun.length]?.kind === 'figure') {
        figureRun.push(cleanedItems[p + figureRun.length] as FigureBlock)
      }

      if (figureRun.length >= 2) {
        const f1 = figureRun[0]
        const f2 = figureRun[1]
        const f3 = figureRun[2]

        const isCompactVertical = (fig: FigureBlock) =>
          (fig.image.origWidth ?? 999) <= 190 &&
          fig.image.aspect <= 1.02 &&
          !fig.topSubCaption &&
          (fig.bottomCaption?.length ?? 0) <= 45

        if (f2 && f3 && isCompactVertical(f1) && isCompactVertical(f2) && isCompactVertical(f3)) {
          outputNodes.push(buildMultiColumnFiguresRow([f1, f2, f3], contentWidth, isA4))
          p += 3
          continue
        }

        if (f2 && isCompactVertical(f1) && isCompactVertical(f2)) {
          outputNodes.push(buildMultiColumnFiguresRow([f1, f2], contentWidth, isA4))
          p += 2
          continue
        }
      }

      // Single Photo Plate + Following Narrative Description ("사진 + 설명")
      const following = collectFollowingSectionProse(p + 1)
      const plateNode = buildBorderlessFigureNode(
        item,
        contentWidth,
        isA4,
        isOnlyImageInChapter,
        following.totalChars >= 95
      )

      if (following.nodes.length > 0) {
        outputNodes.push({
          stack: [plateNode, ...following.nodes],
          unbreakable: true,
          margin: [0, 3.5, 0, 8],
        })
        p += 1 + following.count
        continue
      }

      outputNodes.push(plateNode)
      p += 1
    }
  }

  return outputNodes
}
