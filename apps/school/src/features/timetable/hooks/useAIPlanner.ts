import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, QuickAction, AIGeneratedSchedule } from '../types/ai-planner.types'
import { streamChat, generateSchedule, applyDraft } from '../api/ai-planner.api'

export function useAIPlanner(context: { classId?: string; sectionId?: string; teacherId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<AIGeneratedSchedule | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const messageIdCounter = useRef(0)

  const nextId = () => `msg-${++messageIdCounter.current}`

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    // Add user message
    const userMsg: ChatMessage = {
      id: nextId(), role: 'user', content: content.trim(), timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    // Create assistant message placeholder
    const assistantId = nextId()
    const assistantMsg: ChatMessage = {
      id: assistantId, role: 'assistant', content: '', timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMsg])
    setIsStreaming(true)

    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    await streamChat(
      allMessages,
      context,
      (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk.content } : m
          ))
        }
        if (chunk.type === 'schedule' && chunk.schedule) {
          setCurrentSchedule(chunk.schedule)
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, schedule: chunk.schedule } : m
          ))
        }
        if (chunk.type === 'quickActions' && chunk.quickActions) {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, quickActions: chunk.quickActions } : m
          ))
        }
      },
      () => setIsStreaming(false),
      (error) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content || `Sorry, something went wrong: ${error.message}` }
            : m
        ))
        setIsStreaming(false)
      },
    )
  }, [messages, isStreaming, context])

  const directGenerate = useCallback(async () => {
    if (!context.classId || !context.sectionId) return
    setIsGenerating(true)
    try {
      const { schedule } = await generateSchedule(context.classId, context.sectionId)
      setCurrentSchedule(schedule)

      const msg: ChatMessage = {
        id: nextId(), role: 'assistant', timestamp: new Date(),
        content: `Generated timetable: ${schedule.summary.totalSlotsFilled}/${schedule.summary.totalSlotsAvailable} slots filled. ${schedule.conflicts.length === 0 ? 'No conflicts.' : `${schedule.conflicts.length} conflict(s).`}`,
        schedule,
        quickActions: [
          { label: 'Apply as Draft', action: 'apply_draft' },
          { label: 'Regenerate', action: 'regenerate' },
        ],
      }
      setMessages(prev => [...prev, msg])
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: nextId(), role: 'assistant', content: `Generation failed: ${error.message}`, timestamp: new Date(),
      }])
    }
    setIsGenerating(false)
  }, [context])

  const applyAsDraft = useCallback(async () => {
    if (!currentSchedule) return
    setIsGenerating(true)
    try {
      const result = await applyDraft(currentSchedule)
      setMessages(prev => [...prev, {
        id: nextId(), role: 'assistant', content: result.message, timestamp: new Date(),
        quickActions: [{ label: 'View Timetable', action: 'view_timetable' }],
      }])
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: nextId(), role: 'assistant', content: `Failed to save: ${error.message}`, timestamp: new Date(),
      }])
    }
    setIsGenerating(false)
  }, [currentSchedule])

  const clearChat = useCallback(() => {
    setMessages([])
    setCurrentSchedule(null)
  }, [])

  return { messages, isStreaming, isGenerating, currentSchedule, sendMessage, directGenerate, applyAsDraft, clearChat }
}
