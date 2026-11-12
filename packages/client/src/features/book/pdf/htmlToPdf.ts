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
  //    (e.g. <p><img /><img /></p> stays together as <p data-book-img-row="1">)
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

      // Ignore whitespace between sibling inline images so <p><img /> <img /></p> stays one row
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
} {
  const trimmed = plainText.trim()
  if (!trimmed || el.tagName === 'TABLE' || el.tagName === 'UL' || el.tagName === 'OL') {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
    }
  }

  // 1. Bottom captions: "▲..." or "소감: ..." placed immediately beneath photos
  if (
    (/^[▲△▼▽]\s*\S+/.test(trimmed) || /^소감\s*:/.test(trimmed)) &&
    trimmed.length <= 130
  ) {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: true,
      isSubNoteCandidate: false,
    }
  }

  // 2. Parenthetical sub-notes: "(각 팀 MVP는 대표 1명만 선정했으나...)"
  if (/^\([^()]+\)$/.test(trimmed) && trimmed.length <= 120) {
    return {
      isTopCaptionCandidate: false,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: true,
    }
  }

  // 3. Explicit top captions / section titles:
  //    <...>, [...], 【...】, #01 ..., 1. ..., ♥ 1> ..., or badge captions
  const isBracketTop =
    (/^<[^<>]+>$/.test(trimmed) ||
      /^\[[^[\]]+\]$/.test(trimmed) ||
      /^【[^【】]+】$/.test(trimmed) ||
      /^#\d+\s+\S+/.test(trimmed) ||
      /^[★☆♥♡♪♬※]?\s*\d+\s*[.)>번]\s*\S+/.test(trimmed) ||
      el.getAttribute('data-book-badge-caption') === '1') &&
    trimmed.length <= 95

  if (isBracketTop) {
    return {
      isTopCaptionCandidate: true,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
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
    }
  }

  // Short single-line plain text lead-ins (e.g. "제보 받아요!!", "사진 제보하면 안잡아먹지~~", "볼링 2차 본선 결과 >> ...")
  const isListBullet = /^[•·\-*]\s/.test(trimmed)
  const isSeparatorLine = /^[-=_~]{5,}/.test(trimmed)
  if (!hasBr && !isListBullet && !isSeparatorLine && trimmed.length <= 46) {
    return {
      isTopCaptionCandidate: true,
      isBottomCaptionCandidate: false,
      isSubNoteCandidate: false,
    }
  }

  return {
    isTopCaptionCandidate: false,
    isBottomCaptionCandidate: false,
    isSubNoteCandidate: false,
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
    const maxH = isA4 ? 210 : 145
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
      p: { margin: [0, 0, 0, isA4 ? 4 : 3] },
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
    fontSize: isA4 ? 9.2 : 8.4,
    bold: true,
    color: '#142834',
    alignment: align,
    lineHeight: 1.32,
    margin: [0, 0, 0, 3.5],
  }
}

function buildSubCaptionNode(text: string, isA4: boolean, align: 'left' | 'center' = 'left'): any {
  return {
    text,
    fontSize: isA4 ? 8.3 : 7.6,
    color: '#475569',
    alignment: align,
    lineHeight: 1.35,
    margin: [0, 0, 0, 4],
  }
}

function buildBottomCaptionNode(text: string, isA4: boolean): any {
  return {
    text,
    fontSize: isA4 ? 8.3 : 7.6,
    color: '#475569',
    alignment: 'center',
    lineHeight: 1.35,
    margin: [0, 3.5, 0, 0],
  }
}

// Render a single figure directly on the page (no artificial border box)
function buildBorderlessFigureNode(
  fig: FigureBlock,
  contentWidth: number,
  isA4: boolean,
  isOnlyImageInChapter: boolean,
  isDenseChapter: boolean
): any {
  const origW = fig.image.origWidth
  const isSmallAuthored = origW !== null && origW <= 225
  const isWideAuthored = origW !== null && origW >= 340

  const maxImgW = isSmallAuthored
    ? Math.min(contentWidth, origW * (isA4 ? 0.92 : 0.72))
    : contentWidth

  let maxImgH: number
  if (isOnlyImageInChapter) {
    maxImgH = isA4 ? 310 : 220
  } else if (isSmallAuthored) {
    maxImgH = isDenseChapter ? (isA4 ? 112 : 76) : isA4 ? 142 : 100
  } else if (isWideAuthored) {
    maxImgH = isDenseChapter ? (isA4 ? 135 : 88) : isA4 ? 185 : 130
  } else {
    maxImgH = isDenseChapter ? (isA4 ? 132 : 88) : isA4 ? 175 : 124
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
    margin: [0, 3, 0, isDenseChapter ? 5.5 : 8],
  }
}

// Render 2 or 3 consecutive FigureBlocks side-by-side in equal-height columns
function buildMultiColumnFiguresRow(
  figures: FigureBlock[],
  contentWidth: number,
  isA4: boolean,
  isDenseChapter: boolean,
  isGalleryRun = false
): any {
  const count = figures.length
  const gap = isA4 ? 12 : 8
  const colWidth = (contentWidth - gap * (count - 1)) / count
  const maxGridImgH =
    count >= 3
      ? isA4 ? 112 : 76
      : isGalleryRun
        ? isA4 ? 162 : 114
        : isDenseChapter
          ? isA4 ? 110 : 74
          : isA4 ? 150 : 104

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
        fontSize: isA4 ? 8.6 : 7.8,
        bold: true,
        color: '#142834',
        alignment: 'left',
        lineHeight: 1.3,
        margin: [0, 0, 0, 3],
      })
    }
    if (fig.topSubCaption) {
      colStack.push({
        text: fig.topSubCaption,
        fontSize: isA4 ? 7.8 : 7.1,
        color: '#475569',
        alignment: 'left',
        lineHeight: 1.3,
        margin: [0, 0, 0, 3],
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
        text: fig.bottomCaption,
        fontSize: isA4 ? 7.8 : 7.1,
        color: '#475569',
        alignment: 'center',
        lineHeight: 1.3,
        margin: [2, 3.5, 2, 0],
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
    margin: [0, isGalleryRun ? 6 : 3, 0, isGalleryRun ? 10 : isDenseChapter ? 5.5 : 8],
  }
}

// Render an explicit multi-image row (or 2x2 multi-row group) authored inline in the DB
function buildImageRowBlockNode(
  block: ImageRowBlock,
  contentWidth: number,
  isA4: boolean,
  isDenseChapter: boolean
): any {
  const stack: any[] = []
  const isMultiRowGroup = block.rows.length >= 2

  if (block.topCaption) {
    stack.push(buildTopCaptionNode(block.topCaption, isA4, 'left'))
  }

  block.rows.forEach((rowImages, rowIdx) => {
    const count = rowImages.length
    const gap = isA4 ? 10 : 7
    const colWidth = (contentWidth - gap * (count - 1)) / count
    const maxRowH =
      count >= 3
        ? isA4 ? 110 : 74
        : isMultiRowGroup
          ? isA4 ? 104 : 72
          : isDenseChapter
            ? isA4 ? 112 : 76
            : isA4 ? 145 : 102

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
          fontSize: isA4 ? 8.2 : 7.4,
          bold: true,
          color: '#142834',
          alignment: 'left',
          lineHeight: 1.3,
          margin: [0, 0, 0, 3],
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
      margin: [0, rowIdx > 0 ? 4 : 0, 0, 0],
    })
  })

  if (block.bottomCaption) {
    stack.push(buildBottomCaptionNode(block.bottomCaption, isA4))
  }

  return {
    stack,
    unbreakable: true,
    margin: [0, 3, 0, isDenseChapter ? 5.5 : 8],
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
        rawTokens.push({ kind: 'image-row', images: rowImgs })
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

    const { isTopCaptionCandidate, isBottomCaptionCandidate, isSubNoteCandidate } =
      classifyTextParagraph(el, plainText)
    const isHeading = /^H[1-6]$/.test(el.tagName)
    const pdfNodes = convertElementToNodes(el, contentWidth, dims, isA4)

    if (pdfNodes.length > 0) {
      rawTokens.push({
        kind: 'text',
        plainText,
        isTopCaptionCandidate,
        isBottomCaptionCandidate,
        isSubNoteCandidate,
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
  const isDenseChapter = totalImages >= 5

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
      if (rawTokens[idx + step]?.kind === 'text' && (rawTokens[idx + step] as TextToken).isBottomCaptionCandidate) {
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

    // Pattern 2: [TopCaption ("3. 족구" / "4. 농구")] -> [ImageRow] (+ optional 2nd ImageRow) (+ optional BottomCaption)
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

    // Fallback for standalone ColLabels without an immediately following image-row
    if (cur.kind === 'col-labels') {
      editorialItems.push({
        kind: 'text',
        plainText: cur.labels.join('   |   '),
        isTopCaptionCandidate: false,
        isBottomCaptionCandidate: false,
        isSubNoteCandidate: false,
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

  // 3. Compose Editorial Book Nodes
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
        margin: [0, 5, 0, 6],
      })
      p += 1
      continue
    }

    if (item.kind === 'image-row-block') {
      outputNodes.push(buildImageRowBlockNode(item, contentWidth, isA4, isDenseChapter))
      p += 1
      continue
    }

    // Collect a contiguous run of text blocks (and internal spacers) before a figure/image-row
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

      // Bind cohesive sub-sections (like "♥ 1조..." + bullet points) with their following
      // standalone figure or image-row-block so the photo never splits onto the next page alone.
      const isAttachableFigure =
        followingItem?.kind === 'figure' &&
        !followingItem.topCaption &&
        cleanedItems[look + 1]?.kind !== 'figure'
      const isAttachableRow =
        followingItem?.kind === 'image-row-block' && !followingItem.topCaption

      if (
        (isAttachableFigure || isAttachableRow) &&
        textOnly.length >= 1 &&
        textOnly.length <= 9 &&
        totalChars <= 340
      ) {
        const sectionStack: any[] = []
        for (const t of textRun) {
          if (t.kind === 'spacer') sectionStack.push({ text: '', margin: [0, 1.5, 0, 1.5] })
          else sectionStack.push(...t.pdfNodes)
        }
        sectionStack.push(
          followingItem.kind === 'figure'
            ? buildBorderlessFigureNode(
                followingItem,
                contentWidth,
                isA4,
                isOnlyImageInChapter,
                isDenseChapter
              )
            : buildImageRowBlockNode(followingItem, contentWidth, isA4, isDenseChapter)
        )
        outputNodes.push({
          stack: sectionStack,
          unbreakable: true,
          margin: [0, 3, 0, 6],
        })
        p = look + 1
        continue
      }

      // If the text run is longer (e.g. Story 12 2조 with 25 lines of commonalities) and followed
      // by a standalone figure or image-row, bind the last paragraph with the photo(s).
      if ((isAttachableFigure || isAttachableRow) && textRun.length >= 2) {
        const lastToken = textRun[textRun.length - 1]
        if (lastToken.kind === 'text' && lastToken.plainText.length <= 220) {
          for (let k = 0; k < textRun.length - 1; k++) {
            const tk = textRun[k]
            if (tk.kind === 'spacer') outputNodes.push({ text: '', margin: [0, 1.5, 0, 1.5] })
            else outputNodes.push(...tk.pdfNodes)
          }
          outputNodes.push({
            stack: [
              ...lastToken.pdfNodes,
              followingItem.kind === 'figure'
                ? buildBorderlessFigureNode(
                    followingItem,
                    contentWidth,
                    isA4,
                    isOnlyImageInChapter,
                    isDenseChapter
                  )
                : buildImageRowBlockNode(followingItem, contentWidth, isA4, isDenseChapter),
            ],
            unbreakable: true,
            margin: [0, 2, 0, 6],
          })
          p = look + 1
          continue
        }
      }

      // If a single heading/intro line is followed by a captioned FigureBlock or ImageRowBlock
      // (like "<사진 제보>" in Story 13 or "[경기 스케치 - 1부]" in Story 4), keep the heading attached
      if (
        textOnly.length === 1 &&
        totalChars <= 65 &&
        (followingItem?.kind === 'image-row-block' || followingItem?.kind === 'figure')
      ) {
        // Only bind directly if it's a single image-row-block; for figure runs, let the figure run pair 2-up/3-up below!
        if (followingItem.kind === 'image-row-block') {
          outputNodes.push({
            stack: [
              ...textOnly[0].pdfNodes,
              buildImageRowBlockNode(followingItem, contentWidth, isA4, isDenseChapter),
            ],
            unbreakable: true,
            margin: [0, 3, 0, 6],
          })
          p = look + 1
          continue
        }
      }

      outputNodes.push(...item.pdfNodes)
      p += 1
      continue
    }

    if (item.kind === 'figure') {
      const figureRun: FigureBlock[] = [item]
      while (cleanedItems[p + figureRun.length]?.kind === 'figure') {
        figureRun.push(cleanedItems[p + figureRun.length] as FigureBlock)
      }

      if (figureRun.length >= 2) {
        let f = 0
        while (f < figureRun.length) {
          const f1 = figureRun[f]
          const f2 = figureRun[f + 1]
          const f3 = figureRun[f + 2]

          // Check for 3 consecutive small figures (e.g. three 150px memes in Story 13)
          const canPairThreeUp =
            f2 &&
            f3 &&
            (f1.image.origWidth ?? 999) <= 185 &&
            (f2.image.origWidth ?? 999) <= 185 &&
            (f3.image.origWidth ?? 999) <= 185 &&
            !f1.topSubCaption &&
            !f2.topSubCaption &&
            !f3.topSubCaption

          if (canPairThreeUp) {
            outputNodes.push(
              buildMultiColumnFiguresRow([f1, f2, f3], contentWidth, isA4, isDenseChapter)
            )
            f += 3
            continue
          }

          // Pair any 2 consecutive figures side-by-side unless either was authored as a wide table/banner (width >= 340)
          // or has a multi-line parenthetical sub-note (like the final MVP section)
          const isWideBanner = (fig: FigureBlock) => (fig.image.origWidth ?? 0) >= 340
          const canPairTwoUp =
            f2 &&
            !isWideBanner(f1) &&
            !isWideBanner(f2) &&
            !f1.topSubCaption &&
            !f2.topSubCaption &&
            (f1.topCaption?.length ?? 0) <= 68 &&
            (f2.topCaption?.length ?? 0) <= 68

          if (canPairTwoUp) {
            outputNodes.push(
              buildMultiColumnFiguresRow(
                [f1, f2],
                contentWidth,
                isA4,
                isDenseChapter,
                figureRun.length >= 4
              )
            )
            f += 2
            continue
          }

          outputNodes.push(
            buildBorderlessFigureNode(f1, contentWidth, isA4, false, isDenseChapter)
          )
          f += 1
        }
        p += figureRun.length
        continue
      }

      outputNodes.push(
        buildBorderlessFigureNode(
          item,
          contentWidth,
          isA4,
          isOnlyImageInChapter,
          isDenseChapter
        )
      )
      p += 1
    }
  }

  return outputNodes
}
