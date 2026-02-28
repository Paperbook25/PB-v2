import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { Send, Square, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useUIStore, useAgentChatOpen } from '@/stores/useUIStore'
import { useAgentChat } from '@/hooks/useAgentChat'
import { AgentChatMessages } from './AgentChatMessages'

export function AgentChatDrawer() {
  const open = useAgentChatOpen()
  const closeAgentChat = useUIStore((s) => s.closeAgentChat)
  const { messages, isLoading, send, stop, clear } = useAgentChat()
  const [input, setInput] = useState('')

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      if (!input.trim() || isLoading) return
      send(input)
      setInput('')
    },
    [input, isLoading, send],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleStarterClick = useCallback(
    (message: string) => {
      send(message)
    },
    [send],
  )

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && closeAgentChat()}>
      <SheetContent side="right" className="flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div>
              <SheetTitle>Executive Assistant</SheetTitle>
              <SheetDescription>Ask anything about your school</SheetDescription>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-600"
                onClick={clear}
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages area */}
        <AgentChatMessages
          messages={messages}
          isLoading={isLoading}
          onStarterClick={handleStarterClick}
        />

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 px-3 py-2">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-red-500 hover:text-red-600"
                onClick={stop}
                title="Stop"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!input.trim()}
                title="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
          <p className="text-[10px] text-gray-400 mt-1 text-center">
            Cmd+J to toggle &middot; AI can make mistakes
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
