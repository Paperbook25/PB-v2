import { ChatOllama } from '@langchain/ollama'
import { HumanMessage, SystemMessage, AIMessage, type BaseMessage } from '@langchain/core/messages'
import { prisma } from '../config/db.js'
import { env } from '../config/env.js'

// ==================== Types ====================

export interface SchedulingContext {
  periods: Array<{ id: string; name: string; periodNumber: number; startTime: string; endTime: string; type: string }>
  subjects: Array<{ id: string; name: string; code: string; type: string; weeklyPeriods: number }>
  teachers: Array<{ id: string; name: string; specialization: string | null }>
  rooms: Array<{ id: string; name: string; type: string; capacity: number | null }>
  existingEntries: Array<{ dayOfWeek: string; periodId: string; teacherId: string | null; roomId: string | null; timetableId: string }>
  classId: string
  sectionId: string
  className: string
  sectionName: string
  academicYearId: string
}

export interface ScheduleEntry {
  dayOfWeek: string
  periodId: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  roomId: string
  roomName: string
}

export interface AIGeneratedSchedule {
  classId: string
  sectionId: string
  academicYearId: string
  entries: ScheduleEntry[]
  conflicts: Array<{ type: 'teacher' | 'room' | 'class'; message: string; day: string; periodId: string }>
  summary: {
    totalSlotsFilled: number
    totalSlotsAvailable: number
    subjectDistribution: Record<string, { assigned: number; target: number }>
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

// Default weekly periods for subjects when not configured
const DEFAULT_WEEKLY_PERIODS: Record<string, number> = {
  mathematics: 6, english: 5, science: 5, physics: 5, chemistry: 5, biology: 5,
  social_studies: 4, hindi: 4, history: 4, geography: 3, economics: 3,
  computer_science: 2, physical_education: 2, art: 2, music: 2, moral_science: 1,
}

function guessWeeklyPeriods(subjectName: string): number {
  const key = subjectName.toLowerCase().replace(/\s+/g, '_')
  return DEFAULT_WEEKLY_PERIODS[key] || 3
}

// ==================== Context Gathering ====================

export async function gatherSchedulingContext(classId: string, sectionId: string): Promise<SchedulingContext> {
  const academicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } })
  if (!academicYear) throw new Error('No current academic year found')

  const classData = await prisma.class.findUnique({ where: { id: classId } })
  const sectionData = await prisma.section.findUnique({ where: { id: sectionId } })

  const [periods, classSubjects, teachers, rooms, existingEntries] = await Promise.all([
    prisma.periodDefinition.findMany({
      where: { isActive: true },
      orderBy: { periodNumber: 'asc' },
    }),
    prisma.classSubject.findMany({
      where: { classId, academicYearId: academicYear.id },
      include: { subject: true },
    }),
    prisma.staff.findMany({
      where: { status: 'active' },
      select: { id: true, firstName: true, lastName: true, specialization: true },
    }),
    prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true, capacity: true },
    }),
    prisma.timetableEntry.findMany({
      where: {
        timetable: { status: { not: 'tt_archived' } },
      },
      select: { dayOfWeek: true, periodId: true, teacherId: true, roomId: true, timetableId: true },
    }),
  ])

  const roomTypeFromDb: Record<string, string> = {
    room_classroom: 'classroom', room_lab: 'lab', room_library: 'library',
    room_auditorium: 'auditorium', room_sports: 'sports',
  }
  const periodTypeFromDb: Record<string, string> = {
    period_class: 'class', period_break: 'break', period_lunch: 'lunch',
    period_assembly: 'assembly', period_activity: 'activity',
  }

  return {
    periods: periods.map(p => ({
      id: p.id, name: p.name, periodNumber: p.periodNumber,
      startTime: p.startTime, endTime: p.endTime,
      type: periodTypeFromDb[p.type] || p.type,
    })),
    subjects: classSubjects.map(cs => ({
      id: cs.subject.id, name: cs.subject.name, code: cs.subject.code,
      type: cs.subject.type, weeklyPeriods: guessWeeklyPeriods(cs.subject.name),
    })),
    teachers: teachers.map(t => ({
      id: t.id, name: `${t.firstName} ${t.lastName}`.trim(),
      specialization: t.specialization,
    })),
    rooms: rooms.map(r => ({
      id: r.id, name: r.name, type: roomTypeFromDb[r.type] || r.type,
      capacity: r.capacity,
    })),
    existingEntries: existingEntries.map(e => ({
      dayOfWeek: e.dayOfWeek, periodId: e.periodId,
      teacherId: e.teacherId, roomId: e.roomId, timetableId: e.timetableId,
    })),
    classId,
    sectionId,
    className: classData?.name || classId,
    sectionName: sectionData?.name || sectionId,
    academicYearId: academicYear.id,
  }
}

// ==================== Deterministic Scheduler ====================

export function generateSchedule(context: SchedulingContext): AIGeneratedSchedule {
  const classPeriods = context.periods.filter(p => p.type === 'class')
  const totalSlotsAvailable = classPeriods.length * DAYS.length
  const conflicts: AIGeneratedSchedule['conflicts'] = []
  const entries: ScheduleEntry[] = []

  // Track what's been assigned
  const teacherBusy = new Map<string, Set<string>>() // `${day}-${periodId}` -> teacherIds
  const roomBusy = new Map<string, Set<string>>()
  const slotFilled = new Set<string>() // `${day}-${periodId}`

  // Pre-populate from existing entries (other timetables)
  for (const e of context.existingEntries) {
    const slotKey = `${e.dayOfWeek}-${e.periodId}`
    if (e.teacherId) {
      if (!teacherBusy.has(slotKey)) teacherBusy.set(slotKey, new Set())
      teacherBusy.get(slotKey)!.add(e.teacherId)
    }
    if (e.roomId) {
      if (!roomBusy.has(slotKey)) roomBusy.set(slotKey, new Set())
      roomBusy.get(slotKey)!.add(e.roomId)
    }
  }

  // Infer teacher-subject mapping from existing timetable entries
  const teacherSubjectMap = new Map<string, Set<string>>() // subjectId -> Set<teacherId>
  // We'd need subjectId on existing entries - for now use specialization matching
  for (const teacher of context.teachers) {
    if (teacher.specialization) {
      for (const subject of context.subjects) {
        const spec = teacher.specialization.toLowerCase()
        const subName = subject.name.toLowerCase()
        if (spec.includes(subName) || subName.includes(spec) ||
            (spec.includes('math') && subName.includes('math')) ||
            (spec.includes('science') && (subName.includes('science') || subName.includes('physics') || subName.includes('chemistry') || subName.includes('biology'))) ||
            (spec.includes('english') && subName.includes('english')) ||
            (spec.includes('computer') && subName.includes('computer'))) {
          if (!teacherSubjectMap.has(subject.id)) teacherSubjectMap.set(subject.id, new Set())
          teacherSubjectMap.get(subject.id)!.add(teacher.id)
        }
      }
    }
  }

  // Sort subjects by constraint level: fewest available teachers first
  const sortedSubjects = [...context.subjects].sort((a, b) => {
    const aTeachers = teacherSubjectMap.get(a.id)?.size || 0
    const bTeachers = teacherSubjectMap.get(b.id)?.size || 0
    return aTeachers - bTeachers
  })

  // Core subjects should go in morning periods
  const coreSubjects = new Set(
    context.subjects
      .filter(s => ['mathematics', 'english', 'science', 'physics', 'chemistry'].some(c => s.name.toLowerCase().includes(c)))
      .map(s => s.id)
  )

  // Assign each subject
  for (const subject of sortedSubjects) {
    const target = subject.weeklyPeriods
    let assigned = 0

    // Distribute evenly across days
    const periodsPerDay = Math.ceil(target / DAYS.length)
    const dayAssigned = new Map<string, number>()

    // Determine which rooms suit this subject
    const needsLab = subject.type === 'practical' || subject.name.toLowerCase().includes('computer') ||
      (subject.name.toLowerCase().includes('science') && subject.type !== 'theory')
    const suitableRooms = context.rooms.filter(r =>
      needsLab ? r.type === 'lab' : r.type === 'classroom'
    )
    const fallbackRooms = context.rooms.filter(r => r.type === 'classroom')
    const roomPool = suitableRooms.length > 0 ? suitableRooms : fallbackRooms

    // Get candidate teachers
    const candidateTeachers = teacherSubjectMap.get(subject.id)
    const teacherPool = candidateTeachers && candidateTeachers.size > 0
      ? context.teachers.filter(t => candidateTeachers.has(t.id))
      : context.teachers.slice(0, 3) // Fallback: use first few teachers

    // Sort periods: morning first for core subjects
    const orderedPeriods = coreSubjects.has(subject.id)
      ? [...classPeriods]
      : [...classPeriods].reverse()

    for (const day of DAYS) {
      if (assigned >= target) break
      const dayCount = dayAssigned.get(day) || 0
      if (dayCount >= periodsPerDay) continue

      for (const period of orderedPeriods) {
        if (assigned >= target) break
        const slotKey = `${day}-${period.id}`
        if (slotFilled.has(slotKey)) continue

        // Check previous period for back-to-back avoidance
        const prevPeriod = classPeriods.find(p => p.periodNumber === period.periodNumber - 1)
        if (prevPeriod) {
          const prevSlotKey = `${day}-${prevPeriod.id}`
          const prevEntry = entries.find(e => e.dayOfWeek === day && e.periodId === prevPeriod.id)
          if (prevEntry && prevEntry.subjectId === subject.id) continue // avoid back-to-back
        }

        // Find available teacher
        const busyTeachers = teacherBusy.get(slotKey) || new Set()
        const availableTeacher = teacherPool.find(t => !busyTeachers.has(t.id))
        if (!availableTeacher) {
          if (teacherPool.length > 0) {
            conflicts.push({
              type: 'teacher', message: `No available teacher for ${subject.name} on ${day} period ${period.name}`,
              day, periodId: period.id,
            })
          }
          continue
        }

        // Find available room
        const busyRooms = roomBusy.get(slotKey) || new Set()
        const availableRoom = roomPool.find(r => !busyRooms.has(r.id))
        if (!availableRoom) {
          conflicts.push({
            type: 'room', message: `No available room for ${subject.name} on ${day} period ${period.name}`,
            day, periodId: period.id,
          })
          continue
        }

        // Assign
        entries.push({
          dayOfWeek: day, periodId: period.id,
          subjectId: subject.id, subjectName: subject.name,
          teacherId: availableTeacher.id, teacherName: availableTeacher.name,
          roomId: availableRoom.id, roomName: availableRoom.name,
        })

        slotFilled.add(slotKey)
        if (!teacherBusy.has(slotKey)) teacherBusy.set(slotKey, new Set())
        teacherBusy.get(slotKey)!.add(availableTeacher.id)
        if (!roomBusy.has(slotKey)) roomBusy.set(slotKey, new Set())
        roomBusy.get(slotKey)!.add(availableRoom.id)

        assigned++
        dayAssigned.set(day, dayCount + 1)
      }
    }
  }

  // Build summary
  const subjectDistribution: Record<string, { assigned: number; target: number }> = {}
  for (const subject of context.subjects) {
    const assigned = entries.filter(e => e.subjectId === subject.id).length
    subjectDistribution[subject.name] = { assigned, target: subject.weeklyPeriods }
  }

  return {
    classId: context.classId,
    sectionId: context.sectionId,
    academicYearId: context.academicYearId,
    entries,
    conflicts,
    summary: {
      totalSlotsFilled: entries.length,
      totalSlotsAvailable,
      subjectDistribution,
    },
  }
}

// ==================== LLM Chat Handler ====================

function getLLM() {
  const provider = env.LLM_PROVIDER

  if (provider === 'ollama') {
    return new ChatOllama({
      baseUrl: env.OLLAMA_BASE_URL,
      model: env.OLLAMA_MODEL,
      temperature: 0.3,
    })
  }

  // Default to Ollama
  return new ChatOllama({
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL,
    temperature: 0.3,
  })
}

function buildSystemPrompt(context: SchedulingContext | null): string {
  let prompt = `You are an AI timetable planning assistant for a school management system called PaperBook.
You help administrators, principals, and teachers plan and create class timetables.

Your capabilities:
- Generate timetables for a class and section
- Check for scheduling conflicts
- Suggest schedule improvements
- Answer questions about the current schedule

Keep responses concise and actionable. When a user asks to generate a timetable, confirm the class and section, then say you will generate it. Include the tag [GENERATE_SCHEDULE] in your response when the user confirms they want to generate a schedule - this triggers the automated schedule generator.

When presenting results, be brief and highlight key stats: slots filled, conflicts, and subject distribution.`

  if (context) {
    prompt += `\n\nCurrent school data context:
- Class: ${context.className} - Section: ${context.sectionName}
- ${context.subjects.length} subjects assigned: ${context.subjects.map(s => `${s.name} (${s.weeklyPeriods}/week)`).join(', ')}
- ${context.teachers.length} teachers available
- ${context.rooms.length} rooms available
- ${context.periods.filter(p => p.type === 'class').length} teaching periods per day
- Days: Monday to Saturday`
  }

  return prompt
}

export async function handleChat(
  messages: ChatMessage[],
  userContext: { classId?: string; sectionId?: string; teacherId?: string },
  onChunk: (chunk: { type: string; content?: string; schedule?: AIGeneratedSchedule; quickActions?: Array<{ label: string; action: string }> }) => void,
) {
  // Gather scheduling context if class is specified
  let schedulingContext: SchedulingContext | null = null
  if (userContext.classId && userContext.sectionId) {
    try {
      schedulingContext = await gatherSchedulingContext(userContext.classId, userContext.sectionId)
    } catch {
      // Context gathering failed, proceed without it
    }
  }

  // Check if the latest user message triggers schedule generation
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const wantsGeneration = lastUserMsg.includes('generate') || lastUserMsg.includes('create') ||
    lastUserMsg.includes('plan') || lastUserMsg.includes('auto')

  if (wantsGeneration && schedulingContext) {
    // Generate schedule deterministically
    const schedule = generateSchedule(schedulingContext)
    const conflictMsg = schedule.conflicts.length === 0
      ? 'No conflicts detected.'
      : `${schedule.conflicts.length} conflict(s) found.`

    const responseText = `Here's the proposed timetable for ${schedulingContext.className} - ${schedulingContext.sectionName}:

**Schedule Summary:**
- ${schedule.summary.totalSlotsFilled}/${schedule.summary.totalSlotsAvailable} slots filled
- ${conflictMsg}

**Subject Distribution:**
${Object.entries(schedule.summary.subjectDistribution).map(([name, d]) => `- ${name}: ${d.assigned}/${d.target} periods`).join('\n')}
${schedule.conflicts.length > 0 ? `\n**Conflicts:**\n${schedule.conflicts.map(c => `- ${c.message}`).join('\n')}` : ''}

You can apply this as a draft timetable, regenerate with different assignments, or edit manually.`

    onChunk({ type: 'text', content: responseText })
    onChunk({ type: 'schedule', schedule })
    onChunk({
      type: 'quickActions',
      quickActions: [
        { label: 'Apply as Draft', action: 'apply_draft' },
        { label: 'Regenerate', action: 'regenerate' },
        { label: 'Edit Manually', action: 'edit_manual' },
      ],
    })
    return
  }

  // Try LLM for conversational responses
  try {
    const llm = getLLM()
    const langchainMessages: BaseMessage[] = [
      new SystemMessage(buildSystemPrompt(schedulingContext)),
      ...messages.map(m =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ]

    const stream = await llm.stream(langchainMessages)
    for await (const chunk of stream) {
      const text = typeof chunk.content === 'string' ? chunk.content : ''
      if (text) {
        onChunk({ type: 'text', content: text })
      }
    }

    // Check if LLM response triggered generation
    // (handled by [GENERATE_SCHEDULE] tag in system prompt)
  } catch (error: any) {
    // LLM unavailable - provide helpful fallback
    const fallbackMsg = env.LLM_PROVIDER === 'ollama'
      ? `I couldn't connect to Ollama at ${env.OLLAMA_BASE_URL}. Make sure Ollama is running with: \`ollama serve\` and you've pulled a model: \`ollama pull ${env.OLLAMA_MODEL}\`.\n\nHowever, I can still generate timetables! The schedule generator works without AI. Just ask me to "generate a timetable" with a class selected.`
      : `AI chat is currently unavailable (${error.message}). However, the schedule generator still works! Select a class and ask to "generate a timetable".`

    onChunk({ type: 'text', content: fallbackMsg })

    // Provide quick actions even without LLM
    if (schedulingContext) {
      onChunk({
        type: 'quickActions',
        quickActions: [
          { label: `Generate ${schedulingContext.className} Schedule`, action: `Generate timetable for ${schedulingContext.className} ${schedulingContext.sectionName}` },
          { label: 'Check Conflicts', action: 'Check for scheduling conflicts' },
        ],
      })
    }
  }
}

// ==================== Bulk Entry Creation ====================

export async function bulkAddEntries(
  timetableId: string,
  entries: Array<{ dayOfWeek: string; periodId: string; subjectId: string; teacherId: string; roomId: string }>
): Promise<{ created: number; conflicts: string[] }> {
  const conflicts: string[] = []
  let created = 0

  await prisma.$transaction(async (tx) => {
    for (const entry of entries) {
      // Check for teacher conflict
      if (entry.teacherId) {
        const teacherConflict = await tx.timetableEntry.findFirst({
          where: {
            dayOfWeek: entry.dayOfWeek as any,
            periodId: entry.periodId,
            teacherId: entry.teacherId,
            timetable: { status: { not: 'tt_archived' } },
            timetableId: { not: timetableId },
          },
        })
        if (teacherConflict) {
          conflicts.push(`Teacher conflict on ${entry.dayOfWeek} period ${entry.periodId}`)
          continue
        }
      }

      // Check for room conflict
      if (entry.roomId) {
        const roomConflict = await tx.timetableEntry.findFirst({
          where: {
            dayOfWeek: entry.dayOfWeek as any,
            periodId: entry.periodId,
            roomId: entry.roomId,
            timetable: { status: { not: 'tt_archived' } },
            timetableId: { not: timetableId },
          },
        })
        if (roomConflict) {
          conflicts.push(`Room conflict on ${entry.dayOfWeek} period ${entry.periodId}`)
          continue
        }
      }

      await tx.timetableEntry.create({
        data: {
          timetableId,
          dayOfWeek: entry.dayOfWeek as any,
          periodId: entry.periodId,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          roomId: entry.roomId,
        },
      })
      created++
    }
  })

  return { created, conflicts }
}
