import { Router } from 'express'
import { schoolAuthMiddleware } from '../middleware/school-auth.middleware.js'
import { rbacMiddleware } from '../middleware/rbac.middleware.js'
import {
  getOnboardingStatus,
  completeOnboardingStep,
  skipOnboarding,
  getSetupChecklist,
  quickSetupAcademics,
  quickSetupFees,
} from '../controllers/onboarding.controller.js'

const router = Router()

// All onboarding routes require authentication + admin/principal role
router.use(schoolAuthMiddleware)
router.use(rbacMiddleware('admin', 'principal'))

router.get('/status', getOnboardingStatus)
router.post('/complete-step', completeOnboardingStep)
router.post('/skip', skipOnboarding)
router.get('/checklist', getSetupChecklist)

// Quick-setup batch endpoints (used by onboarding wizard)
router.post('/quick-setup-academics', quickSetupAcademics)
router.post('/quick-setup-fees', quickSetupFees)

export default router
