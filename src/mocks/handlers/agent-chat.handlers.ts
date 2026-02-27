import { http, HttpResponse } from 'msw'

const KEYWORD_RESPONSES: Record<string, Array<{ type: string; content?: string; toolName?: string; toolResult?: unknown }>> = {
  student: [
    { type: 'tool_start', toolName: 'search_students' },
    { type: 'tool_result', toolName: 'search_students', toolResult: { data: [{ id: 's1', name: 'Arjun Patel', class: 'Class 10', section: 'A', admissionNumber: 'ADM-2024-001', status: 'active' }, { id: 's2', name: 'Priya Sharma', class: 'Class 10', section: 'B', admissionNumber: 'ADM-2024-002', status: 'active' }], meta: { total: 245, page: 1, limit: 10, totalPages: 25 } } },
    { type: 'text', content: 'I found **245 students** in the system. Here are the first few:\n\n| Name | Class | Section | Admission # | Status |\n|------|-------|---------|------------|--------|\n| Arjun Patel | Class 10 | A | ADM-2024-001 | Active |\n| Priya Sharma | Class 10 | B | ADM-2024-002 | Active |\n\nWould you like me to filter by class, section, or search for a specific student?' },
  ],
  attendance: [
    { type: 'tool_start', toolName: 'get_attendance_summary' },
    { type: 'tool_result', toolName: 'get_attendance_summary', toolResult: { data: { month: 2, year: 2026, totalStudents: 45, averageAttendance: 92.3, totalDays: 20 } } },
    { type: 'text', content: 'Here\'s the attendance summary for **February 2026**:\n\n- **Total Students:** 45\n- **Average Attendance:** 92.3%\n- **School Days:** 20\n\nThe attendance rate is above the 90% target. Would you like a breakdown by class or specific student attendance?' },
  ],
  fee: [
    { type: 'tool_start', toolName: 'get_fee_collection_summary' },
    { type: 'tool_result', toolName: 'get_fee_collection_summary', toolResult: { totalAmount: 1250000, totalCount: 180, byPaymentMode: [{ paymentMode: 'online', count: 120, total: 850000 }, { paymentMode: 'cash', count: 60, total: 400000 }] } },
    { type: 'text', content: 'Here\'s the fee collection summary:\n\n- **Total Collected:** ₹12,50,000\n- **Total Payments:** 180\n\n**By Payment Mode:**\n| Mode | Count | Amount |\n|------|-------|--------|\n| Online | 120 | ₹8,50,000 |\n| Cash | 60 | ₹4,00,000 |\n\nNeed more details on any specific fee type or class?' },
  ],
  staff: [
    { type: 'tool_start', toolName: 'list_staff' },
    { type: 'tool_result', toolName: 'list_staff', toolResult: { data: [{ id: 'st1', name: 'Dr. Anil B.', department: 'Mathematics', designation: 'Senior Teacher' }], meta: { total: 32 } } },
    { type: 'text', content: 'There are **32 staff members** in the system. Here\'s a quick overview:\n\n| Name | Department | Designation |\n|------|-----------|-------------|\n| Dr. Anil B. | Mathematics | Senior Teacher |\n\nWould you like to filter by department or see details for a specific staff member?' },
  ],
  timetable: [
    { type: 'tool_start', toolName: 'get_class_timetable' },
    { type: 'tool_result', toolName: 'get_class_timetable', toolResult: { entries: [{ dayOfWeek: 'monday', periodName: 'Period 1', subjectName: 'Mathematics', teacherName: 'Dr. Anil B.' }] } },
    { type: 'text', content: 'Here\'s a sample from the class timetable:\n\n**Monday:**\n| Period | Subject | Teacher |\n|--------|---------|--------|\n| Period 1 | Mathematics | Dr. Anil B. |\n\nTo see a full timetable, please specify the class and section.' },
  ],
  calendar: [
    { type: 'tool_start', toolName: 'get_upcoming_events' },
    { type: 'tool_result', toolName: 'get_upcoming_events', toolResult: [{ title: 'Parent-Teacher Meeting', start: '2026-03-01', type: 'meeting' }, { title: 'Annual Sports Day', start: '2026-03-05', type: 'event' }] },
    { type: 'text', content: 'Here are the upcoming events:\n\n1. **Parent-Teacher Meeting** — March 1, 2026\n2. **Annual Sports Day** — March 5, 2026\n\nWould you like more details about any event?' },
  ],
}

const DEFAULT_RESPONSE = [
  { type: 'text', content: 'I\'m the PaperBook Executive Assistant. I can help you with:\n\n- **Students** — Search, count, and view student details\n- **Staff** — List and view staff information\n- **Attendance** — Summaries and individual records\n- **Calendar** — Upcoming events and holidays\n- **Timetable** — Class and teacher schedules\n- **Finance** — Fee structures, collections, and expenses\n\nWhat would you like to know?' },
]

function findResponse(message: string) {
  const lower = message.toLowerCase()
  for (const [keyword, chunks] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(keyword)) return chunks
  }
  return DEFAULT_RESPONSE
}

export const agentChatHandlers = [
  http.post('/api/agents/chat', async ({ request }) => {
    const body = (await request.json()) as { message: string }
    const chunks = findResponse(body.message || '')
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
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
        }, 150)
      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  }),

  http.get('/api/agents', async () => {
    return HttpResponse.json({
      data: [
        {
          id: 'executive-assistant',
          name: 'Executive Assistant',
          description: 'A read-only generalist agent that answers questions across students, staff, attendance, calendar, timetable, and finance.',
        },
      ],
    })
  }),
]
