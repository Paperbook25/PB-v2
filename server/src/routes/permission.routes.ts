import { Router } from 'express'
import * as permissionCtrl from '../controllers/permission.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All permission routes require auth
router.use(authMiddleware)

// GET /api/permissions - list all permissions grouped by module
router.get('/', rbacMiddleware('admin', 'principal'), permissionCtrl.getAllPermissions)

// GET /api/permissions/role/:role - get permissions for a role
router.get('/role/:role', rbacMiddleware('admin', 'principal'), permissionCtrl.getPermissionsForRole)

// PATCH /api/permissions/role/:role - update permissions for a role
router.patch('/role/:role', rbacMiddleware('admin', 'principal'), permissionCtrl.updateRolePermissions)

export default router
