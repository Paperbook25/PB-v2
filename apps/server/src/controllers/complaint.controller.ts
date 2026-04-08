import type { Request, Response, NextFunction } from 'express'
import * as complaintService from '../services/complaint.service.js'
import { AppError } from '../utils/errors.js'

function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Complaint operations require a school subdomain.')
  }
  return req.schoolId
}

// Frontend-friendly field alias — frontend uses `subject` and `ticketNumber`
function mapComplaintResponse(c: any) {
  return {
    ...c,
    subject: c.title,
    ticketNumber: c.complaintNumber,
    complainantType: c.filedByRole,
  }
}

export async function listComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, category, priority, search } = req.query
    const result = await complaintService.listComplaints(getSchoolId(req), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      category: category as string | undefined,
      priority: priority as string | undefined,
      search: search as string | undefined,
    })
    res.json({ ...result, data: result.data.map(mapComplaintResponse) })
  } catch (err) { next(err) }
}

export async function getComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintService.getComplaintById(getSchoolId(req), String(req.params.id))
    res.json({ data: mapComplaintResponse(complaint) })
  } catch (err) { next(err) }
}

export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, title, description, category, priority, complainantType, filedByRole } = req.body
    const complaint = await complaintService.createComplaint(getSchoolId(req), {
      title: title || subject,
      description,
      category,
      priority,
      filedByRole: filedByRole || complainantType || 'staff',
      filedBy: (req as any).user?.userId || 'unknown',
      filedByName: (req as any).user?.name || 'Unknown',
    })
    res.status(201).json({ data: mapComplaintResponse(complaint) })
  } catch (err) { next(err) }
}

export async function updateComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintService.updateComplaint(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: complaint })
  } catch (err) { next(err) }
}

export async function assignComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintService.assignComplaint(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: complaint })
  } catch (err) { next(err) }
}

export async function resolveComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintService.resolveComplaint(getSchoolId(req), String(req.params.id), req.body)
    res.json({ data: complaint })
  } catch (err) { next(err) }
}

export async function deleteComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await complaintService.deleteComplaint(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) { next(err) }
}

export async function getComplaintStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await complaintService.getComplaintStats(getSchoolId(req))
    const byStatus = stats.byStatus as Record<string, number>
    // Map to frontend-expected shape
    res.json({
      data: {
        ...stats,
        openTickets: (byStatus.open || 0) + (byStatus.in_progress || 0) + (byStatus.submitted || 0) + (byStatus.acknowledged || 0),
        resolvedThisMonth: byStatus.resolved || 0,
        slaComplianceRate: stats.total > 0 ? Math.round(((byStatus.resolved || 0) / stats.total) * 100) : 100,
      },
    })
  } catch (err) { next(err) }
}
