import { useRef, type ChangeEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import ResizeImage from 'tiptap-extension-resize-image'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, ImagePlus, Undo2, Redo2,
} from 'lucide-react'
import { uploadImage } from '../../services/uploads'

const FONTS = [
  { label: '기본', value: '' },
  { label: 'Pretendard', value: 'Pretendard, sans-serif' },
  { label: '둥근모 (픽셀)', value: "'NeoDunggeunmo', monospace" },
  { label: 'S-CoreDream', value: "'S-CoreDream', sans-serif" },
]

const COLORS = ['#333333', '#55B2D4', '#EE3E61', '#2E7D32', '#F57C00', '#6A1B9A']

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Color,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '팀의 이야기를 기록해보세요...' }),
      ResizeImage.configure({ inline: false, allowBase64: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'cy-editor-content' },
      // drop/paste images go through the upload API instead of base64
      handleDrop: (view, event, _slice, moved) => {
        const files = event.dataTransfer?.files
        if (!moved && files && files.length > 0 && files[0].type.startsWith('image/')) {
          event.preventDefault()
          insertUploaded(files[0], view.state.selection.from)
          return true
        }
        return false
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
          event.preventDefault()
          insertUploaded(files[0])
          return true
        }
        return false
      },
    },
  })

  const insertUploaded = async (file: File, position?: number) => {
    if (!editor) return
    try {
      const { url } = await uploadImage(file)
      const chain = editor.chain().focus()
      if (position != null) {
        chain.insertContentAt(position, { type: 'image', attrs: { src: url } }).run()
      } else {
        chain.setImage({ src: url }).run()
      }
    } catch (err: any) {
      window.alert(err.response?.data?.error || '이미지 업로드에 실패했습니다.')
    }
  }

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      await insertUploaded(file)
    }
    e.target.value = ''
  }

  if (!editor) return null

  const btn = (active: boolean) =>
    `cy-btn !px-1.5 !py-0.5 ${active ? '!bg-cy-text-light !text-white' : ''}`

  return (
    <div className='cy-editor'>
      <div className='cy-editor-toolbar'>
        <select
          className='text-[9px] bg-white border border-cy-border-light rounded px-1 py-0.5 font-[inherit] outline-none'
          value={editor.getAttributes('textStyle').fontFamily ?? ''}
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run()
            else editor.chain().focus().unsetFontFamily().run()
          }}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        <span className='cy-editor-sep' />

        <button type='button' className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={10} />
        </button>
        <button type='button' className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={10} />
        </button>
        <button type='button' className={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={10} />
        </button>
        <button type='button' className={btn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={10} />
        </button>

        <span className='cy-editor-sep' />

        {COLORS.map((color) => (
          <button
            key={color}
            type='button'
            className='cy-editor-color'
            style={{ backgroundColor: color, outline: editor.isActive('textStyle', { color }) ? '2px solid var(--color-cy-cyan)' : 'none' }}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}

        <span className='cy-editor-sep' />

        <button type='button' className={btn(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={10} />
        </button>
        <button type='button' className={btn(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={10} />
        </button>
        <button type='button' className={btn(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={10} />
        </button>

        <span className='cy-editor-sep' />

        <button type='button' className='cy-btn !px-1.5 !py-0.5' onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={10} />
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={handleFilePick}
        />

        <span className='cy-editor-sep' />

        <button type='button' className='cy-btn !px-1.5 !py-0.5' onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={10} />
        </button>
        <button type='button' className='cy-btn !px-1.5 !py-0.5' onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={10} />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
