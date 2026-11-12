// Map common expressive emojis to BMP symbols verified in Pretendard,
// and strip remaining supplementary-plane/dingbat pictographs that render as .notdef tofu boxes.
const EMOJI_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[\u{1F389}\u{1F38A}\u{1F973}\u{2B50}\u{1F31F}\u{2728}\u{1F3C6}\u{1F947}\u{1F451}]/gu, '★'],
  [/[\u{2764}\u{1F495}\u{1F496}\u{1F497}\u{1F498}\u{1F499}\u{1F49A}\u{1F49B}\u{1F49C}\u{1F49D}\u{1F49E}\u{1F9E1}\u{1FAF6}]/gu, '♥'],
  [/[\u{1F3B5}\u{1F3B6}\u{1F3A4}\u{1F3A7}]/gu, '♪'],
  [/[\u{1F4CC}\u{1F4CD}\u{1F4E2}\u{1F4E3}]/gu, '※'],
]

export function sanitizeBookText(input: string): string {
  let out = input
  for (const [pattern, replacement] of EMOJI_REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  out = out.replace(/[\uFE00-\uFE0F\u200D]/g, '')
  out = out.replace(/[\u{10000}-\u{10FFFF}]/gu, '')
  // Strip BMP dingbats/misc symbols not in Pretendard while keeping ★☆♥♡♪♬※
  out = out.replace(/(?![★☆♥♡♪♬※])[\u2600-\u27BF]/g, '')
  return out
}

export interface BookOptions {
  title: string
  subtitle: string
  pageSize: 'A5' | 'A4'
  compiler: string
}

export interface BookChapter {
  title: string
  category: string
  authorNickname: string
  dateStr: string
  bodyNodes: any[]
}

// pt sizes: A5 419.53 x 595.28, A4 595.28 x 841.89
const PAGE_MARGINS: [number, number, number, number] = [42, 48, 42, 48]

export function contentWidthFor(pageSize: 'A5' | 'A4'): number {
  const pageWidth = pageSize === 'A5' ? 419.53 : 595.28
  return pageWidth - PAGE_MARGINS[0] - PAGE_MARGINS[2]
}

function formatDotDate(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 10).replace(/-/g, '. ')
}

function formatMonthDay(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr
  return `${dateStr.slice(5, 7)}.${dateStr.slice(8, 10)}`
}

const TOC_TABLE_LAYOUT = {
  hLineWidth: (i: number, node: any) => (i === 0 ? 0 : i === node.table.body.length ? 0.6 : 0.35),
  vLineWidth: () => 0,
  hLineColor: (i: number, node: any) => (i === node.table.body.length ? '#CBD5E1' : '#E8EEF2'),
  paddingLeft: (i: number) => (i === 0 ? 2 : 4),
  paddingRight: (i: number) => (i === 3 ? 2 : 4),
  paddingTop: () => 5.5,
  paddingBottom: () => 5.5,
}

const COLOPHON_TABLE_LAYOUT = {
  hLineWidth: (i: number, node: any) =>
    i === 0 || i === node.table.body.length ? 1 : 0.4,
  vLineWidth: () => 0,
  hLineColor: (i: number, node: any) =>
    i === 0 || i === node.table.body.length ? '#1B3649' : '#D5DEE6',
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5.5,
  paddingBottom: () => 5.5,
}

function buildCoverBackground(pageSize: { width: number; height: number }): any {
  const w = pageSize.width
  const h = pageSize.height
  const outerInset = 22
  const innerInset = 26.5
  const outerW = w - outerInset * 2
  const outerH = h - outerInset * 2
  const innerW = w - innerInset * 2
  const innerH = h - innerInset * 2
  const cornerLen = 10

  return {
    canvas: [
      // Warm editorial archival paper background
      { type: 'rect', x: 0, y: 0, w, h, color: '#FAF8F4' },
      // Top & bottom deep editorial bands
      { type: 'rect', x: outerInset, y: outerInset, w: outerW, h: 4.5, color: '#142834' },
      { type: 'rect', x: outerInset, y: h - outerInset - 4.5, w: outerW, h: 4.5, color: '#142834' },
      // Outer architectural frame
      {
        type: 'rect',
        x: outerInset,
        y: outerInset,
        w: outerW,
        h: outerH,
        lineWidth: 1.2,
        lineColor: '#142834',
      },
      // Inner cyan-slate hairline frame
      {
        type: 'rect',
        x: innerInset,
        y: innerInset,
        w: innerW,
        h: innerH,
        lineWidth: 0.5,
        lineColor: '#298EB5',
      },
      // Corner accent brackets (top-left, top-right, bottom-left, bottom-right)
      { type: 'line', x1: innerInset + 5, y1: innerInset + 5, x2: innerInset + 5 + cornerLen, y2: innerInset + 5, lineWidth: 1, lineColor: '#142834' },
      { type: 'line', x1: innerInset + 5, y1: innerInset + 5, x2: innerInset + 5, y2: innerInset + 5 + cornerLen, lineWidth: 1, lineColor: '#142834' },

      { type: 'line', x1: w - innerInset - 5 - cornerLen, y1: innerInset + 5, x2: w - innerInset - 5, y2: innerInset + 5, lineWidth: 1, lineColor: '#142834' },
      { type: 'line', x1: w - innerInset - 5, y1: innerInset + 5, x2: w - innerInset - 5, y2: innerInset + 5 + cornerLen, lineWidth: 1, lineColor: '#142834' },

      { type: 'line', x1: innerInset + 5, y1: h - innerInset - 5, x2: innerInset + 5 + cornerLen, y2: h - innerInset - 5, lineWidth: 1, lineColor: '#142834' },
      { type: 'line', x1: innerInset + 5, y1: h - innerInset - 5 - cornerLen, x2: innerInset + 5, y2: h - innerInset - 5, lineWidth: 1, lineColor: '#142834' },

      { type: 'line', x1: w - innerInset - 5 - cornerLen, y1: h - innerInset - 5, x2: w - innerInset - 5, y2: h - innerInset - 5, lineWidth: 1, lineColor: '#142834' },
      { type: 'line', x1: w - innerInset - 5, y1: h - innerInset - 5 - cornerLen, x2: w - innerInset - 5, y2: h - innerInset - 5, lineWidth: 1, lineColor: '#142834' },
    ],
  }
}

function buildTocNodes(
  chapters: BookChapter[],
  period: { from: string; to: string },
  contentWidth: number,
  isA4: boolean
): any[] {
  // Group chapters by year (chronological)
  const groups = new Map<string, Array<{ ch: BookChapter; index: number }>>()
  chapters.forEach((ch, index) => {
    const year = ch.dateStr?.slice(0, 4) || '기록'
    const list = groups.get(year) ?? []
    list.push({ ch, index })
    groups.set(year, list)
  })

  const nodes: any[] = [
    {
      text: 'CONTENTS & CHRONICLE',
      fontSize: isA4 ? 8.5 : 7.5,
      bold: true,
      color: '#298EB5',
      characterSpacing: 2,
      pageBreak: 'before',
      margin: [0, 2, 0, 3],
    },
    {
      columns: [
        {
          width: '*',
          text: '목차 및 연보',
          fontSize: isA4 ? 20 : 16.5,
          bold: true,
          color: '#142834',
        },
        {
          width: 'auto',
          text: `${formatDotDate(period.from)} — ${formatDotDate(period.to)}  ·  총 ${chapters.length}편`,
          fontSize: isA4 ? 8.5 : 7.8,
          color: '#64748B',
          margin: [0, isA4 ? 9 : 6, 0, 0],
        },
      ],
      margin: [0, 0, 0, 7],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: contentWidth, y2: 0, lineWidth: 1.4, lineColor: '#142834' },
        { type: 'line', x1: 0, y1: 3, x2: contentWidth, y2: 3, lineWidth: 0.4, lineColor: '#94A3B8' },
      ],
      margin: [0, 0, 0, 12],
    },
  ]

  for (const [year, entries] of groups.entries()) {
    const tableBody = entries.map(({ ch, index }) => {
      const numStr = String(index + 1).padStart(2, '0')
      const cleanTitle = sanitizeBookText(ch.title)
      const cleanCat = sanitizeBookText(ch.category)
      const cleanAuthor = sanitizeBookText(ch.authorNickname)

      return [
        {
          text: numStr,
          fontSize: isA4 ? 8.2 : 7.5,
          bold: true,
          color: '#298EB5',
          margin: [0, 1, 0, 0],
        },
        {
          text: formatMonthDay(ch.dateStr),
          fontSize: isA4 ? 8.2 : 7.5,
          color: '#64748B',
          margin: [0, 1, 0, 0],
        },
        {
          text: [
            {
              text: cleanTitle,
              fontSize: isA4 ? 9.2 : 8.4,
              bold: true,
              color: '#1E293B',
              linkToDestination: `chapter-${index}`,
            },
            {
              text: `   ${cleanCat} · ${cleanAuthor}`,
              fontSize: isA4 ? 7.8 : 7,
              color: '#94A3B8',
            },
          ],
        },
        {
          pageReference: `chapter-${index}`,
          fontSize: isA4 ? 8.5 : 7.8,
          bold: true,
          color: '#142834',
          alignment: 'right',
          margin: [0, 1, 0, 0],
        },
      ]
    })

    nodes.push({
      stack: [
        {
          text: [
            {
              text: `${year}`,
              fontSize: isA4 ? 12 : 10.5,
              bold: true,
              color: '#142834',
            },
            {
              text: `   ·   ${entries.length}편의 기록`,
              fontSize: isA4 ? 8 : 7.4,
              color: '#298EB5',
              bold: true,
            },
          ],
          margin: [0, 6, 0, 4],
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 32, y2: 0, lineWidth: 1.4, lineColor: '#298EB5' },
            { type: 'line', x1: 32, y1: 0, x2: contentWidth, y2: 0, lineWidth: 0.5, lineColor: '#CBD5E1' },
          ],
          margin: [0, 0, 0, 2],
        },
      ],
      unbreakable: true,
    })

    nodes.push({
      table: {
        dontBreakRows: true,
        widths: [18, 32, '*', 26],
        body: tableBody,
      },
      layout: TOC_TABLE_LAYOUT,
      margin: [0, 0, 0, 10],
    })
  }

  return nodes
}

function buildChapterHeaderStack(
  ch: BookChapter,
  index: number,
  contentWidth: number,
  isA4: boolean
): any[] {
  const numStr = String(index + 1).padStart(2, '0')
  const cleanTitle = sanitizeBookText(ch.title)
  const cleanCategory = sanitizeBookText(ch.category)
  const cleanAuthor = sanitizeBookText(ch.authorNickname)
  const accentLen = isA4 ? 44 : 34

  return [
    {
      columns: [
        {
          width: '*',
          text: [
            { text: `STORY ${numStr}`, bold: true, color: '#298EB5', characterSpacing: 0.8 },
            { text: `   ·   ${formatDotDate(ch.dateStr)}`, color: '#64748B', bold: true },
          ],
          fontSize: isA4 ? 8.2 : 7.5,
        },
        {
          width: 'auto',
          text: `${cleanCategory}  |  기록 · ${cleanAuthor}`,
          fontSize: isA4 ? 8 : 7.3,
          color: '#788994',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 3],
    },
    {
      text: cleanTitle,
      id: `chapter-${index}`,
      fontSize: isA4 ? 15 : 13,
      bold: true,
      color: '#122634',
      lineHeight: 1.3,
      margin: [0, 0, 0, 6],
    },
    {
      canvas: [
        { type: 'line', x1: 0, y1: 0, x2: accentLen, y2: 0, lineWidth: 1.5, lineColor: '#298EB5' },
        { type: 'line', x1: accentLen, y1: 0, x2: contentWidth, y2: 0, lineWidth: 0.5, lineColor: '#CBD5E1' },
      ],
      margin: [0, 0, 0, 11],
    },
  ]
}

export function buildBookDocDefinition(
  opts: BookOptions,
  chapters: BookChapter[],
  period: { from: string; to: string }
): any {
  const isA4 = opts.pageSize === 'A4'
  const today = new Date().toISOString().slice(0, 10)
  const contentWidth = contentWidthFor(opts.pageSize)
  const cleanTitle = sanitizeBookText(opts.title)
  const cleanSubtitle = sanitizeBookText(opts.subtitle)
  const cleanCompiler = sanitizeBookText(opts.compiler)

  const coverTopSpace = isA4 ? 130 : 76
  const coverBottomSpace = isA4 ? 170 : 108
  const colophonWidth = isA4 ? 270 : 210
  const colophonMarginX = Math.max(0, (contentWidth - colophonWidth) / 2)

  return {
    pageSize: opts.pageSize,
    pageMargins: PAGE_MARGINS,
    info: { title: cleanTitle, author: cleanCompiler },
    defaultStyle: {
      font: 'Pretendard',
      fontSize: isA4 ? 9.8 : 9,
      lineHeight: 1.52,
      color: '#24292F',
    },
    background: (currentPage: number, pageSize: { width: number; height: number }) =>
      currentPage === 1 ? buildCoverBackground(pageSize) : null,
    header: (currentPage: number) => {
      if (currentPage === 1) return null
      return {
        margin: [PAGE_MARGINS[0], 20, PAGE_MARGINS[2], 0],
        stack: [
          {
            columns: [
              {
                width: '*',
                text: cleanTitle,
                fontSize: 7.2,
                bold: true,
                color: '#788994',
              },
              {
                width: 'auto',
                text: `${period.from.slice(0, 4)} — ${period.to.slice(0, 4)} CHRONICLE`,
                fontSize: 6.8,
                color: '#94A3B8',
                characterSpacing: 0.8,
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 3.5],
          },
          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: contentWidth, y2: 0, lineWidth: 0.4, lineColor: '#E2E8F0' },
            ],
          },
        ],
      }
    },
    footer: (currentPage: number, pageCount: number) =>
      currentPage === 1
        ? null
        : {
            margin: [PAGE_MARGINS[0], 12, PAGE_MARGINS[2], 0],
            columns: [
              {
                width: '*',
                text: `—  ${currentPage}  —`,
                alignment: 'center',
                fontSize: 7.8,
                bold: true,
                color: '#64748B',
              },
            ],
            id: pageCount ? undefined : undefined,
          },
    styles: {
      coverKicker: {
        fontSize: isA4 ? 8.5 : 7.5,
        bold: true,
        color: '#298EB5',
        characterSpacing: 2.5,
        alignment: 'center',
      },
      coverTitle: {
        fontSize: isA4 ? 31 : 23,
        bold: true,
        color: '#122634',
        alignment: 'center',
        lineHeight: 1.22,
      },
      coverSub: {
        fontSize: isA4 ? 12.5 : 10.2,
        color: '#4E6370',
        alignment: 'center',
        lineHeight: 1.4,
      },
      colophonLabel: {
        fontSize: isA4 ? 8.2 : 7.5,
        bold: true,
        color: '#526875',
      },
      colophonValue: {
        fontSize: isA4 ? 8.5 : 7.8,
        bold: true,
        color: '#142834',
        alignment: 'right',
      },
    },
    content: [
      // ===== 표지 (Editorial Archival Cover) =====
      {
        text: 'CHRONICLE ARCHIVE EDITION',
        style: 'coverKicker',
        margin: [0, coverTopSpace, 0, 12],
      },
      {
        canvas: [
          {
            type: 'line',
            x1: contentWidth * 0.38,
            y1: 0,
            x2: contentWidth * 0.62,
            y2: 0,
            lineWidth: 0.8,
            lineColor: '#298EB5',
          },
        ],
        margin: [0, 0, 0, 18],
      },
      {
        text: cleanTitle,
        style: 'coverTitle',
        margin: [12, 0, 12, 10],
      },
      {
        text: cleanSubtitle || '사이좋은 사람들의 기록',
        style: 'coverSub',
        margin: [16, 0, 16, 22],
      },
      // Center geometric emblem ornament
      {
        canvas: [
          {
            type: 'line',
            x1: contentWidth * 0.24,
            y1: 3,
            x2: contentWidth * 0.45,
            y2: 3,
            lineWidth: 0.6,
            lineColor: '#94A3B8',
          },
          {
            type: 'rect',
            x: contentWidth * 0.5 - 2.5,
            y: 0.5,
            w: 5,
            h: 5,
            color: '#298EB5',
          },
          {
            type: 'line',
            x1: contentWidth * 0.55,
            y1: 3,
            x2: contentWidth * 0.76,
            y2: 3,
            lineWidth: 0.6,
            lineColor: '#94A3B8',
          },
        ],
        margin: [0, 0, 0, coverBottomSpace],
      },
      // Bottom Colophon Table
      {
        margin: [colophonMarginX, 0, colophonMarginX, 0],
        table: {
          dontBreakRows: true,
          widths: ['auto', '*'],
          body: [
            [
              { text: '수록 기간', style: 'colophonLabel' },
              { text: `${formatDotDate(period.from)} — ${formatDotDate(period.to)}`, style: 'colophonValue' },
            ],
            [
              { text: '수록 기록', style: 'colophonLabel' },
              { text: `총 ${chapters.length}편의 이야기`, style: 'colophonValue' },
            ],
            [
              { text: '편찬', style: 'colophonLabel' },
              { text: cleanCompiler, style: 'colophonValue' },
            ],
            [
              { text: '발행일', style: 'colophonLabel' },
              { text: formatDotDate(today), style: 'colophonValue' },
            ],
          ],
        },
        layout: COLOPHON_TABLE_LAYOUT,
      },

      // ===== 목차 및 연보 (Grouped by Year) =====
      ...buildTocNodes(chapters, period, contentWidth, isA4),

      // ===== 본문 챕터 (각 스토리는 새로운 페이지에서 명확히 시작) =====
      ...chapters.flatMap((ch, i) => {
        const headerNodes = buildChapterHeaderStack(ch, i, contentWidth, isA4)
        const firstBody = ch.bodyNodes.length > 0 ? [ch.bodyNodes[0]] : []
        const restBody = ch.bodyNodes.length > 1 ? ch.bodyNodes.slice(1) : []

        const leadBlock: any = {
          stack: [...headerNodes, ...firstBody],
          unbreakable: true,
          pageBreak: 'before',
        }

        return [leadBlock, ...restBody]
      }),
    ],
  }
}
