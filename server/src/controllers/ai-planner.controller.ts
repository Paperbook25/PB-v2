import { Request, Response, NextFunction } from 'express'
import { handleChat, bulkAddEntries, gatherSchedulingContext, generateSchedule } from '../services/ai-planner.service.js'
import type { ChatMessage } from '../services/ai-planner.service.js'
import { prisma } from '../config/db.js'

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { messages, context } = req.body as {
      messages: ChatMessage[]
      context: { classId?: string; sectionId?: string; teacherId?: string }
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    await handleChat(messages || [], context || {}, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    if (!res.headersSent) {
      next(error)
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'An error occurred' })}\n\n`)
      res.end()
    }
  }
}

export async function generateAndPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const { classId, sectionId } = req.body as { classId: string; sectionId: string }

    if (!classId || !sectionId) {
      return res.status(400).json({ error: 'classId and sectionId are required' })
    }

    const context = await gatherSchedulingContext(classId, sectionId)
    const schedule = generateSchedule(context)

    res.json({ schedule })
  } catch (error: any) {
    next(error)
  }
}

export async function applyDraft(req: Request, res: Response, next: NextFunction) {
  try {
    const { classId, sectionId, academicYearId, entries } = req.body

    if (!classId || !sectionId || !academicYearId || !entries?.length) {
      return res.status(400).json({ error: 'classId, sectionId, academicYearId, and entries are required' })
    }

    // Create or find existing draft timetable
    let timetable = await prisma.timetable.findFirst({
      where: { classId, sectionId, academicYearId, status: 'tt_draft' },
    })

    if (!timetable) {
      timetable = await prisma.timetable.create({
        data: {
          classId,
          sectionId,
          academicYearId,
          status: 'tt_draft',
          effectiveFrom: new Date(),
        },
      })
    } else {
      // Clear existing entries for a clean slate
      await prisma.timetableEntry.deleteMany({ where: { timetableId: timetable.id } })
    }

    const result = await bulkAddEntries(timetable.id, entries)

    res.json({
      timetableId: timetable.id,
      ...result,
      message: `Draft timetable created with ${result.created} entries${result.conflicts.length > 0 ? ` (${result.conflicts.length} conflicts skipped)` : ''}.`,
    })
  } catch (error) {
    next(error)
  }
}
