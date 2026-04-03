import type { Request, Response, NextFunction } from 'express'
import * as widgetService from '../services/admin-dashboard-widget.service.js'

function getAdminId(req: Request): string {
  return req.user?.userId || req.user?.email || 'unknown'
}

export async function listWidgets(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await widgetService.listWidgets(getAdminId(req))
    res.json({ data })
  } catch (err) { next(err) }
}

export async function createWidget(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await widgetService.createWidget(getAdminId(req), req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function updateWidget(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await widgetService.updateWidget(String(req.params.id), getAdminId(req), req.body)
    res.json({ data })
  } catch (err) { next(err) }
}

export async function deleteWidget(req: Request, res: Response, next: NextFunction) {
  try {
    await widgetService.deleteWidget(String(req.params.id), getAdminId(req))
    res.json({ success: true })
  } catch (err) { next(err) }
}

export async function reorderWidgets(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await widgetService.reorderWidgets(getAdminId(req), req.body.widgetIds)
    res.json(data)
  } catch (err) { next(err) }
}
