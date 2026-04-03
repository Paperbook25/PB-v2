import { Router } from 'express'
import * as controller from '../../controllers/admin-feature-usage.controller.js'

const router = Router()

router.post('/aggregate', controller.aggregateUsage)
router.post('/backfill', controller.backfillAggregation)
router.get('/summary', controller.getFeatureUsageSummary)
router.get('/trends', controller.getFeatureUsageTrends)
router.get('/churn-risk', controller.getChurnRiskSchools)
router.get('/schools/:schoolId', controller.getSchoolFeatureUsage)

export default router
