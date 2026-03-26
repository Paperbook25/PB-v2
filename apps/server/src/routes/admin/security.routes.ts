import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import * as securityService from '../../services/admin-security.service.js'

const router = Router()

router.get('/admins', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await securityService.listAdmins() }) } catch (err) { next(err) }
})

router.post('/admins', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ data: await securityService.createAdmin(req.body) }) } catch (err) { next(err) }
})

router.put('/admins/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await securityService.updateAdmin(String(req.params.id), req.body)) } catch (err) { next(err) }
})

router.delete('/admins/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await securityService.removeAdmin(String(req.params.id))) } catch (err) { next(err) }
})

router.get('/compliance', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await securityService.getComplianceStatus() }) } catch (err) { next(err) }
})

router.get('/login-history', async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await securityService.getLoginHistory() }) } catch (err) { next(err) }
})

export default router
