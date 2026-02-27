import { useAuthStore } from '@/stores/useAuthStore'
import { apiPost } from '@/lib/api-client'
import type { AIGeneratedSchedule } from '../types/ai-planner.types'

export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  context: { classId?: string; sectionId?: string; teacherId?: string },
  onChunk: (chunk: { type: string; content?: string; schedule?: AIGeneratedSchedule; quickActions?: Array<{ label: string; action: string }> }) => void,
  onDone: () => void,
  onError: (error: Error) => void,
) {
  const accessToken = useAuthStore.getState().accessToken

  try {
    const response = await fetch('/api/ai-planner/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ messages, context }),
    })

    if (!response.ok) throw new Error(`Chat failed: ${response.status}`)

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
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            onChunk(JSON.parse(data))
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
    onDone()
  } catch (error) {
    onError(error as Error)
  }
}

export async function generateSchedule(classId: string, sectionId: string): Promise<{ schedule: AIGeneratedSchedule }> {
  return apiPost('/api/ai-planner/generate', { classId, sectionId })
}

export async function applyDraft(schedule: AIGeneratedSchedule): Promise<{ timetableId: string; created: number; conflicts: string[]; message: string }> {
  return apiPost('/api/ai-planner/apply-draft', {
    classId: schedule.classId,
    sectionId: schedule.sectionId,
    academicYearId: schedule.academicYearId,
    entries: schedule.entries.map(e => ({
      dayOfWeek: e.dayOfWeek,
      periodId: e.periodId,
      subjectId: e.subjectId,
      teacherId: e.teacherId,
      roomId: e.roomId,
    })),
  })
}
