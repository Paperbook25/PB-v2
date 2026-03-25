import { useRef, useEffect, useCallback } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...', minHeight = '300px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize content on mount only
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    handleChange()
  }, [handleChange])

  const handleLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) exec('createLink', url)
  }, [exec])

  const handleImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) exec('insertImage', url)
  }, [exec])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        .rich-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rich-editor h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .rich-editor p { margin: 0.5rem 0; }
        .rich-editor blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 0.75rem 0; }
        .rich-editor pre, .rich-editor code { background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; }
        .rich-editor pre { padding: 0.75rem 1rem; margin: 0.75rem 0; display: block; overflow-x: auto; }
        .rich-editor img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; }
        .rich-editor ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor a { color: #2563eb; text-decoration: underline; }
        .rich-editor hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* Text formatting */}
        <ToolbarButton icon="B" title="Bold (Ctrl+B)" onClick={() => exec('bold')} className="font-bold" />
        <ToolbarButton icon="I" title="Italic (Ctrl+I)" onClick={() => exec('italic')} className="italic" />
        <ToolbarButton icon="U" title="Underline (Ctrl+U)" onClick={() => exec('underline')} className="underline" />
        <Separator />

        {/* Headings */}
        <ToolbarButton icon="H2" title="Heading 2" onClick={() => exec('formatBlock', 'h2')} />
        <ToolbarButton icon="H3" title="Heading 3" onClick={() => exec('formatBlock', 'h3')} />
        <ToolbarButton
          icon={<span className="text-xs">P</span>}
          title="Paragraph"
          onClick={() => exec('formatBlock', 'p')}
        />
        <Separator />

        {/* Lists & quote */}
        <ToolbarButton
          icon={<span className="text-base leading-none">&bull;</span>}
          title="Bullet List"
          onClick={() => exec('insertUnorderedList')}
        />
        <ToolbarButton icon="1." title="Numbered List" onClick={() => exec('insertOrderedList')} />
        <ToolbarButton
          icon={<span className="text-base leading-none">&ldquo;</span>}
          title="Blockquote"
          onClick={() => exec('formatBlock', 'blockquote')}
        />
        <Separator />

        {/* Insert */}
        <ToolbarButton
          icon={<LinkIcon />}
          title="Insert Link"
          onClick={handleLink}
        />
        <ToolbarButton
          icon={<ImageIconSvg />}
          title="Insert Image"
          onClick={handleImage}
        />
        <ToolbarButton icon="--" title="Horizontal Rule" onClick={() => exec('insertHorizontalRule')} />
        <Separator />

        {/* Undo/Redo */}
        <ToolbarButton
          icon={<UndoIcon />}
          title="Undo (Ctrl+Z)"
          onClick={() => exec('undo')}
        />
        <ToolbarButton
          icon={<RedoIcon />}
          title="Redo (Ctrl+Y)"
          onClick={() => exec('redo')}
        />
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label={placeholder}
        aria-multiline="true"
        className="rich-editor px-4 py-3 outline-none text-sm text-gray-900 leading-relaxed"
        style={{ minHeight }}
        onInput={handleChange}
        onBlur={handleChange}
        data-placeholder={placeholder}
      />
    </div>
  )
}

// --- Toolbar sub-components ---

function ToolbarButton({ icon, title, onClick, className }: {
  icon: React.ReactNode
  title: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors text-gray-700 ${className || ''}`}
    >
      {icon}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-5 bg-gray-300 mx-1" />
}

// --- Inline SVG icons (small, no external deps) ---

function LinkIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ImageIconSvg() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
    </svg>
  )
}
