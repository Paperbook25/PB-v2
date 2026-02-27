import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'

const MOCK_SCHEDULE = {
  classId: 'class-6',
  sectionId: 'section-a',
  academicYearId: 'ay-2025-26',
  entries: [
    { dayOfWeek: 'monday', periodId: 'p1', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'monday', periodId: 'p2', subjectId: 's2', subjectName: 'English', teacherId: 't2', teacherName: 'Prof. Sunita V.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'monday', periodId: 'p3', subjectId: 's3', subjectName: 'Science', teacherId: 't3', teacherName: 'Dr. Suresh N.', roomId: 'r3', roomName: 'Lab 1' },
    { dayOfWeek: 'monday', periodId: 'p4', subjectId: 's4', subjectName: 'Hindi', teacherId: 't4', teacherName: 'Mrs. Kavitha R.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'monday', periodId: 'p5', subjectId: 's5', subjectName: 'Social Studies', teacherId: 't5', teacherName: 'Mr. Rajesh T.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'tuesday', periodId: 'p1', subjectId: 's2', subjectName: 'English', teacherId: 't2', teacherName: 'Prof. Sunita V.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'tuesday', periodId: 'p2', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'tuesday', periodId: 'p3', subjectId: 's6', subjectName: 'Computer Science', teacherId: 't6', teacherName: 'Mr. Vikram P.', roomId: 'r4', roomName: 'Computer Lab' },
    { dayOfWeek: 'tuesday', periodId: 'p4', subjectId: 's3', subjectName: 'Science', teacherId: 't3', teacherName: 'Dr. Suresh N.', roomId: 'r3', roomName: 'Lab 1' },
    { dayOfWeek: 'tuesday', periodId: 'p5', subjectId: 's4', subjectName: 'Hindi', teacherId: 't4', teacherName: 'Mrs. Kavitha R.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'wednesday', periodId: 'p1', subjectId: 's3', subjectName: 'Science', teacherId: 't3', teacherName: 'Dr. Suresh N.', roomId: 'r3', roomName: 'Lab 1' },
    { dayOfWeek: 'wednesday', periodId: 'p2', subjectId: 's5', subjectName: 'Social Studies', teacherId: 't5', teacherName: 'Mr. Rajesh T.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'wednesday', periodId: 'p3', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'wednesday', periodId: 'p4', subjectId: 's2', subjectName: 'English', teacherId: 't2', teacherName: 'Prof. Sunita V.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'wednesday', periodId: 'p5', subjectId: 's7', subjectName: 'Physical Education', teacherId: 't7', teacherName: 'Mr. Deepak K.', roomId: 'r5', roomName: 'Sports Ground' },
    { dayOfWeek: 'thursday', periodId: 'p1', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'thursday', periodId: 'p2', subjectId: 's3', subjectName: 'Science', teacherId: 't3', teacherName: 'Dr. Suresh N.', roomId: 'r3', roomName: 'Lab 1' },
    { dayOfWeek: 'thursday', periodId: 'p3', subjectId: 's4', subjectName: 'Hindi', teacherId: 't4', teacherName: 'Mrs. Kavitha R.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'thursday', periodId: 'p4', subjectId: 's5', subjectName: 'Social Studies', teacherId: 't5', teacherName: 'Mr. Rajesh T.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'thursday', periodId: 'p5', subjectId: 's8', subjectName: 'Art', teacherId: 't8', teacherName: 'Mrs. Priya M.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'friday', periodId: 'p1', subjectId: 's2', subjectName: 'English', teacherId: 't2', teacherName: 'Prof. Sunita V.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'friday', periodId: 'p2', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'friday', periodId: 'p3', subjectId: 's3', subjectName: 'Science', teacherId: 't3', teacherName: 'Dr. Suresh N.', roomId: 'r3', roomName: 'Lab 1' },
    { dayOfWeek: 'friday', periodId: 'p4', subjectId: 's6', subjectName: 'Computer Science', teacherId: 't6', teacherName: 'Mr. Vikram P.', roomId: 'r4', roomName: 'Computer Lab' },
    { dayOfWeek: 'friday', periodId: 'p5', subjectId: 's5', subjectName: 'Social Studies', teacherId: 't5', teacherName: 'Mr. Rajesh T.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'saturday', periodId: 'p1', subjectId: 's1', subjectName: 'Mathematics', teacherId: 't1', teacherName: 'Dr. Anil B.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'saturday', periodId: 'p2', subjectId: 's2', subjectName: 'English', teacherId: 't2', teacherName: 'Prof. Sunita V.', roomId: 'r2', roomName: 'Room 102' },
    { dayOfWeek: 'saturday', periodId: 'p3', subjectId: 's7', subjectName: 'Physical Education', teacherId: 't7', teacherName: 'Mr. Deepak K.', roomId: 'r5', roomName: 'Sports Ground' },
    { dayOfWeek: 'saturday', periodId: 'p4', subjectId: 's4', subjectName: 'Hindi', teacherId: 't4', teacherName: 'Mrs. Kavitha R.', roomId: 'r1', roomName: 'Room 101' },
    { dayOfWeek: 'saturday', periodId: 'p5', subjectId: 's8', subjectName: 'Art', teacherId: 't8', teacherName: 'Mrs. Priya M.', roomId: 'r2', roomName: 'Room 102' },
  ],
  conflicts: [],
  summary: {
    totalSlotsFilled: 30,
    totalSlotsAvailable: 30,
    subjectDistribution: {
      'Mathematics': { assigned: 6, target: 6 },
      'English': { assigned: 5, target: 5 },
      'Science': { assigned: 5, target: 5 },
      'Hindi': { assigned: 4, target: 4 },
      'Social Studies': { assigned: 4, target: 4 },
      'Computer Science': { assigned: 2, target: 2 },
      'Physical Education': { assigned: 2, target: 2 },
      'Art': { assigned: 2, target: 2 },
    },
  },
}

export const aiPlannerHandlers = [
  // SSE Chat endpoint (mock)
  http.post('/api/ai-planner/chat', async ({ request }) => {
    await mockDelay('heavy')
    const body = await request.json() as { messages: Array<{ role: string; content: string }>; context: any }
    const lastMsg = body.messages?.[body.messages.length - 1]?.content?.toLowerCase() || ''

    // Check if user wants to generate
    const wantsGenerate = lastMsg.includes('generate') || lastMsg.includes('create') || lastMsg.includes('plan') || lastMsg.includes('auto')

    if (wantsGenerate) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const chunks = [
            { type: 'text', content: 'Here\'s the proposed timetable for the selected class:\n\n**Schedule Summary:**\n- 30/30 slots filled\n- No conflicts detected\n\n**Subject Distribution:**\n- Mathematics: 6/6 periods\n- English: 5/5 periods\n- Science: 5/5 periods\n- Hindi: 4/4 periods\n- Social Studies: 4/4 periods\n- Computer Science: 2/2 periods\n- Physical Education: 2/2 periods\n- Art: 2/2 periods\n\nYou can apply this as a draft timetable, regenerate, or edit manually.' },
            { type: 'schedule', schedule: MOCK_SCHEDULE },
            { type: 'quickActions', quickActions: [{ label: 'Apply as Draft', action: 'apply_draft' }, { label: 'Regenerate', action: 'regenerate' }] },
          ]
          let i = 0
          const interval = setInterval(() => {
            if (i < chunks.length) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunks[i])}\n\n`))
              i++
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              clearInterval(interval)
            }
          }, 100)
        },
      })

      return new HttpResponse(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }

    // Default conversational response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const response = `I can help you plan timetables! Here's what I can do:\n\n- **Generate a full timetable** for a class and section\n- **Check for conflicts** in existing schedules\n- **View current schedules** for a class or teacher\n\nSelect a class filter on the calendar, then ask me to generate a timetable.`
        const chunks = [
          { type: 'text', content: response },
          { type: 'quickActions', quickActions: [
            { label: 'Generate timetable', action: 'Generate a timetable for this class' },
            { label: 'Check conflicts', action: 'Check for scheduling conflicts' },
          ] },
        ]
        let i = 0
        const interval = setInterval(() => {
          if (i < chunks.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunks[i])}\n\n`))
            i++
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
            clearInterval(interval)
          }
        }, 100)
      },
    })

    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }),

  // Direct generate endpoint
  http.post('/api/ai-planner/generate', async () => {
    await mockDelay('heavy')
    return HttpResponse.json({ schedule: MOCK_SCHEDULE })
  }),

  // Apply draft endpoint
  http.post('/api/ai-planner/apply-draft', async () => {
    await mockDelay('write')
    return HttpResponse.json({
      timetableId: 'tt-draft-001',
      created: 30,
      conflicts: [],
      message: 'Draft timetable created with 30 entries.',
    })
  }),
]
