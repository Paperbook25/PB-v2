import { Router } from 'express'
import * as controller from '../../controllers/admin-user.controller.js'

const router = Router()

// GET    /api/admin/users              — List users (paginated, filterable)
router.get('/', controller.listUsers)

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
