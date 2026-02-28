import type { Request, Response, NextFunction } from 'express'
import * as auditService from '../services/audit.service.js'

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await auditService.listAuditLogs({
      module: req.query.module as string | undefined,
      action: req.query.action as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}
