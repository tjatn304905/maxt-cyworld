import { useCallback, useState } from 'react'
import type { HistoryPost } from '../../types'
import * as postService from '../../services/posts'
import { ensurePdfMake } from './pdf/fonts'
import { fetchImages } from './pdf/images'
import {
  parsePostHtml, preprocessDoc, collectImageUrls, applyInlinedImages, convertDocToPdfNodes,
} from './pdf/htmlToPdf'
import { buildBookDocDefinition, contentWidthFor, type BookOptions } from './pdf/bookPdf'

export type BookExportStep =
  | 'idle' | 'fetching' | 'fonts' | 'images' | 'building' | 'done' | 'error'

export interface BookExportOptions extends BookOptions {
  from?: string
  to?: string
  category?: string
}

function sortKey(post: HistoryPost): string {
  return `${post.eventDate?.slice(0, 10) ?? post.createdAt?.slice(0, 10) ?? ''}|${post.createdAt ?? ''}`
}

async function fetchAllPosts(): Promise<HistoryPost[]> {
  const all: HistoryPost[] = []
  let page = 1
  for (;;) {
    const res = await postService.getPosts({ page, limit: 100 })
    all.push(...res.data)
    if (all.length >= res.total || res.data.length === 0) break
    page += 1
  }
  return all
}

export function useBookExport() {
  const [step, setStep] = useState<BookExportStep>('idle')
  const [imageProgress, setImageProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [skippedImages, setSkippedImages] = useState(0)

  const reset = useCallback(() => {
    setStep('idle')
    setError(null)
    setSkippedImages(0)
    setImageProgress({ done: 0, total: 0 })
  }, [])

  const run = useCallback(async (opts: BookExportOptions) => {
    setError(null)
    setSkippedImages(0)
    try {
      // 1. collect posts (chronicle order: oldest first)
      setStep('fetching')
      let posts = await fetchAllPosts()
      if (opts.from) posts = posts.filter((p) => (p.eventDate?.slice(0, 10) ?? '') >= opts.from!)
      if (opts.to) posts = posts.filter((p) => (p.eventDate?.slice(0, 10) ?? '') <= opts.to!)
      if (opts.category) posts = posts.filter((p) => p.category === opts.category)
      posts.sort((a, b) => sortKey(a).localeCompare(sortKey(b)))

      if (posts.length === 0) {
        setError('조건에 맞는 게시글이 없습니다.')
        setStep('error')
        return
      }

      // 2. pdfmake + Korean fonts
      setStep('fonts')
      const pdfMake = await ensurePdfMake()

      // 3. parse & preprocess bodies, inline images
      const docs = posts.map((post) => {
        const doc = parsePostHtml(post.content)
        preprocessDoc(doc)
        return doc
      })
      const allUrls = docs.flatMap((doc) => collectImageUrls(doc))
      setStep('images')
      setImageProgress({ done: 0, total: new Set(allUrls).size })
      const images = await fetchImages(allUrls, (done, total) =>
        setImageProgress({ done, total })
      )
      let skipped = 0
      docs.forEach((doc) => {
        skipped += applyInlinedImages(doc, images)
      })
      setSkippedImages(skipped)

      // 4. build & download
      setStep('building')
      const contentWidth = contentWidthFor(opts.pageSize)
      const chapters = posts.map((post, i) => ({
        title: post.title,
        category: post.category,
        authorNickname: post.author?.nickname ?? '알 수 없음',
        dateStr: post.eventDate?.slice(0, 10) ?? post.createdAt?.slice(0, 10) ?? '',
        bodyNodes: convertDocToPdfNodes(docs[i], contentWidth, images),
      }))
      const period = {
        from: chapters[0].dateStr,
        to: chapters[chapters.length - 1].dateStr,
      }
      const docDefinition = buildBookDocDefinition(opts, chapters, period)

      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      await pdfMake.createPdf(docDefinition).download(`${opts.title}_${stamp}.pdf`)
      setStep('done')
    } catch (err: any) {
      console.error('book export failed:', err)
      setError(err.response?.data?.error || err.message || '역사서 생성에 실패했습니다.')
      setStep('error')
    }
  }, [])

  return { step, imageProgress, error, skippedImages, run, reset }
}
