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
const PAGE_MARGINS: [number, number, number, number] = [46, 52, 46, 58]

export function contentWidthFor(pageSize: 'A5' | 'A4'): number {
  const pageWidth = pageSize === 'A5' ? 419.53 : 595.28
  return pageWidth - PAGE_MARGINS[0] - PAGE_MARGINS[2]
}

export function buildBookDocDefinition(
  opts: BookOptions,
  chapters: BookChapter[],
  period: { from: string; to: string }
): any {
  const coverTop = opts.pageSize === 'A5' ? 150 : 230
  const today = new Date().toISOString().slice(0, 10)
  const contentWidth = contentWidthFor(opts.pageSize)

  return {
    pageSize: opts.pageSize,
    pageMargins: PAGE_MARGINS,
    info: { title: opts.title, author: opts.compiler },
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9.5,
      lineHeight: 1.55,
      color: '#222222',
    },
    footer: (currentPage: number, pageCount: number) =>
      currentPage === 1
        ? null
        : {
            text: `${currentPage} / ${pageCount}`,
            alignment: 'center',
            fontSize: 8,
            color: '#999999',
            margin: [0, 24, 0, 0],
          },
    styles: {
      coverTitle: { fontSize: 26, bold: true, alignment: 'center' },
      coverSub: { fontSize: 12, alignment: 'center', color: '#666666' },
      coverMeta: { fontSize: 10, alignment: 'center', color: '#888888' },
      tocTitle: { fontSize: 16, bold: true, margin: [0, 0, 0, 14] },
      chapterMeta: { fontSize: 8, color: '#999999' },
    },
    content: [
      // ===== 표지 =====
      { text: opts.title, style: 'coverTitle', margin: [0, coverTop, 0, 10] },
      { text: opts.subtitle, style: 'coverSub', margin: [0, 0, 0, 24] },
      {
        canvas: [
          { type: 'line', x1: contentWidth * 0.25, y1: 0, x2: contentWidth * 0.75, y2: 0, lineWidth: 0.8, lineColor: '#bbbbbb' },
        ],
        margin: [0, 0, 0, 24],
      },
      { text: `${period.from} ~ ${period.to}`, style: 'coverMeta', margin: [0, 0, 0, 4] },
      { text: `발행일 ${today}`, style: 'coverMeta', margin: [0, 0, 0, 4] },
      { text: `편찬 ${opts.compiler}`, style: 'coverMeta' },

      // ===== 목차 (연혁) =====
      {
        toc: {
          title: { text: '목 차', style: 'tocTitle' },
          textMargin: [0, 3, 0, 3],
          textStyle: { fontSize: 9 },
        },
        pageBreak: 'before',
      },

      // ===== 챕터 =====
      ...chapters.flatMap((ch, i) => [
        {
          text: [
            { text: `${ch.dateStr}  `, color: '#888888', fontSize: 10 },
            { text: ch.title, bold: true, fontSize: 14 },
          ],
          tocItem: true,
          tocStyle: { fontSize: 9 },
          pageBreak: 'before',
          margin: [0, 0, 0, 2],
          id: `chapter-${i}`,
        },
        { text: `${ch.category} · ${ch.authorNickname}`, style: 'chapterMeta' },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: contentWidth, y2: 0, lineWidth: 0.8, lineColor: '#cccccc' },
          ],
          margin: [0, 8, 0, 14],
        },
        ...ch.bodyNodes,
      ]),
    ],
  }
}
