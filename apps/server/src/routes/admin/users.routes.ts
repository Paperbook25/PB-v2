import { Router } from 'express'
import * as controller from '../../controllers/admin-user.controller.js'

const router = Router()

// GET    /api/admin/users              — List users (paginated, filterable)
router.get('/', controller.listUsers)

// GET    /api/admin/users/export       — Export users as CSV
router.get('/export', async (req, res, next) => {
  try {
    const { prisma } = await import('../../config/db.js')
    const users = await (prisma as any).user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, banned: true },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })
    const header = 'Name,Email,Role,Status,Joined'
    const rows = users.map((u: any) =>
      [u.name, u.email, u.role, u.banned ? 'Banned' : 'Active', u.createdAt?.toISOString().slice(0, 10)].map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"')
    res.send('\uFEFF' + header + '\n' + rows.join('\n'))
  } catch (err) { next(err) }
})

// POST   /api/admin/users/impersonate  — Impersonate a user (placeholder)
router.post('/impersonate', controller.impersonate)

// PATCH  /api/admin/users/:id/role   — Update user role
router.patch('/:id/role', controller.updateUserRole)

// DELETE /api/admin/users/:id        — Delete a user
router.delete('/:id', controller.deleteUser)

// GET    /api/admin/users/:id          — Get user details
router.get('/:id', controller.getUser)

// PATCH  /api/admin/users/:id/ban      — Ban a user
router.patch('/:id/ban', controller.banUser)

// PATCH  /api/admin/users/:id/unban    — Unban a user
router.patch('/:id/unban', controller.unbanUser)

export default router
