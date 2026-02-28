import { Router } from 'express'
import * as controller from '../../controllers/admin-school.controller.js'

const router = Router()

// GET    /api/admin/schools              — List schools (paginated, filterable)
router.get('/', controller.listSchools)

// POST   /api/admin/schools              — Create a new school
router.post('/', controller.createSchool)

// GET    /api/admin/schools/:id          — Get school details with stats
router.get('/:id', controller.getSchool)

// PUT    /api/admin/schools/:id          — Update school profile
router.put('/:id', controller.updateSchool)

// PATCH  /api/admin/schools/:id/suspend  — Suspend a school
router.patch('/:id/suspend', controller.suspendSchool)

// PATCH  /api/admin/schools/:id/activate — Activate a suspended school
router.patch('/:id/activate', controller.activateSchool)

// DELETE /api/admin/schools/:id          — Soft-delete a school (mark as churned)
router.delete('/:id', controller.deleteSchool)

// GET    /api/admin/schools/:id/users    — Get users for a school
router.get('/:id/users', controller.getSchoolUsers)

// GET    /api/admin/schools/:id/addons   — Get addons for a school
router.get('/:id/addons', controller.getSchoolAddons)

// PATCH  /api/admin/schools/:id/addons/:slug — Toggle an addon for a school
router.patch('/:id/addons/:slug', controller.toggleSchoolAddon)

export default router
