import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as calendarService from '../../services/calendar.service.js'
import type { AgentTool, Role } from '../types.js'

const allowedRoles: Role[] = ['admin', 'principal', 'teacher', 'parent']

const getCalendarEventsTool = tool(
  async (input) => {
    const result = await calendarService.getCalendarEvents('', {
      startDate: input.startDate,
      endDate: input.endDate,
      type: input.type as 'all' | 'classes' | 'events' | 'holidays' | undefined,
    })
    return JSON.stringify(result)
  },
  {
    name: 'get_calendar_events',
    description:
      'Get calendar events within a date range. Returns holidays, exams, meetings, and school events.',
    schema: z.object({
      startDate: z.string().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().describe('End date (YYYY-MM-DD)'),
      type: z
        .string()
        .optional()
        .describe('Filter by event type: all, classes, events, holidays'),
    }),
  },
)

const getUpcomingEventsTool = tool(
  async () => {
    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const result = await calendarService.getCalendarEvents('', {
      startDate: now.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      type: 'events',
    })
    return JSON.stringify(result)
  },
  {
    name: 'get_upcoming_events',
    description: 'Get all upcoming school events in the next 7 days. No parameters needed.',
    schema: z.object({}),
  },
)

export const calendarTools: AgentTool[] = [
  { tool: getCalendarEventsTool, classification: 'READ_ONLY', allowedRoles },
  { tool: getUpcomingEventsTool, classification: 'READ_ONLY', allowedRoles },
]
