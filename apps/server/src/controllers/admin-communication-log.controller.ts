import type { Request, Response, NextFunction } from 'express'
import * as commLogService from '../services/admin-communication-log.service.js'

export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await commLogService.listCommunicationLogs(req.query as any)
    res.json(result)
  } catch (err) { next(err) }
}

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await commLogService.logCommunication({
      ...req.body,
      sentBy: req.user?.userId || req.user?.email,
      sentByName: req.user?.name || 'Admin',
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}
