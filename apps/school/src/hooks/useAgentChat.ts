import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: Array<{ toolName: string; status: 'running' | 'done'; result?: unknown }>
  isStreaming?: boolean
  isError?: boolean
}

interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_result' | 'error' | 'approval_required'
  content?: string
  toolName?: string
  toolResult?: unknown
}

export function useAgentChat(agentId = 'executive-assistant') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
    }

    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: message.trim(), agentId }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const chunk: StreamChunk = JSON.parse(data)

            setMessages((prev) => {
              const msgs = [...prev]
              const idx = msgs.findIndex((m) => m.id === assistantId)
              if (idx === -1) return prev

              const current = { ...msgs[idx] }
              const tools = [...(current.toolCalls || [])]

              switch (chunk.type) {
                case 'text':
                  current.content += chunk.content || ''
                  break
                case 'tool_start':
                  tools.push({ toolName: chunk.toolName || '', status: 'running' })
                  current.toolCalls = tools
                  // Show a subtle indicator instead of the raw function name
                  if (!current.content) {
                    current.content = '_Looking up data..._\n\n'
                  }
                  break
                case 'tool_result': {
                  const toolIdx = tools.findIndex(
                    (t) => t.toolName === chunk.toolName && t.status === 'running',
                  )
                  if (toolIdx >= 0) {
                    tools[toolIdx] = { ...tools[toolIdx], status: 'done' }
                    current.toolCalls = tools
                  }
                  // Strip the "Looking up data..." placeholder once we start getting real text
                  if (current.content === '_Looking up data..._\n\n') {
                    current.content = ''
                  }
                  break
                }
                case 'error':
                  current.content += chunk.content || 'An error occurred'
                  current.isError = true
                  break
              }

              msgs[idx] = current
              return msgs
            })
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
      )
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content || 'Stopped.', isStreaming: false } : m,
          ),
        )
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Failed to get a response. Please try again.', isStreaming: false, isError: true }
              : m,
          ),
        )
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [isLoading, agentId])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(false)
  }, [])

  return { messages, isLoading, send, stop, clear }
}
