import type { Request, Response, NextFunction } from 'express'
import * as staffService from '../services/staff.service.js'
import { AppError } from '../utils/errors.js'
import { listStaffSchema } from '../validators/staff.validators.js'
import type {
  CreateStaffInput, UpdateStaffInput, CreatePDInput, UpdatePDInput,
  CreateReviewInput, CreateStaffSkillInput, UpdateStaffSkillInput,
  CreateCertificationInput, UpdateCertificationInput,
  CreateOnboardingInput, UpdateOnboardingTaskInput,
  CreateExitInterviewInput, UpdateExitInterviewInput,
  UpdateClearanceInput, BulkImportStaffInput,
} from '../validators/staff.validators.js'

// Helper: extract and validate schoolId from tenant middleware
function getSchoolId(req: Request): string {
  if (!req.schoolId) {
    throw AppError.badRequest('No school context. Staff operations require a school subdomain.')
  }
  return req.schoolId
}

// ==================== CRUD ====================

export async function listStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = getSchoolId(req)
    const query = listStaffSchema.parse(req.query)
    const result = await staffService.listStaff(schoolId, query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.getStaffById(getSchoolId(req), String(req.params.id))
    res.json({ data: staff })
  } catch (err) {
    next(err)
  }
}

export async function createStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.createStaff(getSchoolId(req), req.body as CreateStaffInput)
    res.status(201).json({ data: staff })
  } catch (err) {
    next(err)
  }
}

export async function updateStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.updateStaff(getSchoolId(req), String(req.params.id), req.body as UpdateStaffInput)
    res.json({ data: staff })
  } catch (err) {
    next(err)
  }
}

export async function deleteStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffService.deleteStaff(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== Professional Development ====================

export async function listAllPD(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await staffService.listAllPD(getSchoolId(req))
    res.json({ data: records })
  } catch (err) {
    next(err)
  }
}

export async function listStaffPD(req: Request, res: Response, next: NextFunction) {
  try {
    const records = await staffService.listStaffPD(getSchoolId(req), String(req.params.id))
    res.json({ data: records })
  } catch (err) {
    next(err)
  }
}

export async function createPD(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await staffService.createPD(getSchoolId(req), String(req.params.id), req.body as CreatePDInput)
    res.status(201).json({ data: record })
  } catch (err) {
    next(err)
  }
}

export async function updatePD(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await staffService.updatePD(getSchoolId(req), String(req.params.id), req.body as UpdatePDInput)
    res.json({ data: record })
  } catch (err) {
    next(err)
  }
}

export async function deletePD(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffService.deletePD(getSchoolId(req), String(req.params.id))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== Performance Reviews ====================

export async function listAllReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await staffService.listAllReviews(getSchoolId(req))
    res.json({ data: reviews })
  } catch (err) {
    next(err)
  }
}

export async function listStaffReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await staffService.listStaffReviews(getSchoolId(req), String(req.params.id))
    res.json({ data: reviews })
  } catch (err) {
    next(err)
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await staffService.createReview(getSchoolId(req), req.body as CreateReviewInput)
    res.status(201).json({ data: review })
  } catch (err) {
    next(err)
  }
}

export async function acknowledgeReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await staffService.acknowledgeReview(getSchoolId(req), String(req.params.id))
    res.json({ data: review })
  } catch (err) {
    next(err)
  }
}

// ==================== Skills ====================

export async function listStaffSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const skills = await staffService.listStaffSkills(getSchoolId(req), String(req.params.id))
    res.json({ data: skills })
  } catch (err) {
    next(err)
  }
}

export async function addStaffSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await staffService.addStaffSkill(getSchoolId(req), String(req.params.id), req.body as CreateStaffSkillInput)
    res.status(201).json({ data: skill })
  } catch (err) {
    next(err)
  }
}

export async function updateStaffSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await staffService.updateStaffSkill(
      getSchoolId(req),
      String(req.params.id),
      String(req.params.skillId),
      req.body as UpdateStaffSkillInput,
    )
    res.json({ data: skill })
  } catch (err) {
    next(err)
  }
}

export async function deleteStaffSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffService.deleteStaffSkill(getSchoolId(req), String(req.params.id), String(req.params.skillId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getSkillGaps(req: Request, res: Response, next: NextFunction) {
  try {
    const gaps = await staffService.getSkillGaps(getSchoolId(req), String(req.params.id))
    res.json({ data: gaps })
  } catch (err) {
    next(err)
  }
}

export async function getSkillsMatrix(req: Request, res: Response, next: NextFunction) {
  try {
    const matrix = await staffService.getSkillsMatrix(getSchoolId(req))
    res.json({ data: matrix })
  } catch (err) {
    next(err)
  }
}

// ==================== Certifications ====================

export async function listStaffCertifications(req: Request, res: Response, next: NextFunction) {
  try {
    const certs = await staffService.listStaffCertifications(getSchoolId(req), String(req.params.id))
    res.json({ data: certs })
  } catch (err) {
    next(err)
  }
}

export async function addCertification(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await staffService.addCertification(getSchoolId(req), String(req.params.id), req.body as CreateCertificationInput)
    res.status(201).json({ data: cert })
  } catch (err) {
    next(err)
  }
}

export async function updateCertification(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await staffService.updateCertification(
      getSchoolId(req),
      String(req.params.id),
      String(req.params.certId),
      req.body as UpdateCertificationInput,
    )
    res.json({ data: cert })
  } catch (err) {
    next(err)
  }
}

export async function deleteCertification(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await staffService.deleteCertification(getSchoolId(req), String(req.params.id), String(req.params.certId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getExpiryAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await staffService.getExpiryAlerts(getSchoolId(req))
    res.json({ data: alerts })
  } catch (err) {
    next(err)
  }
}

// ==================== Onboarding ====================

export async function listOnboardingTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await staffService.listOnboardingTasks(getSchoolId(req))
    res.json({ data: tasks })
  } catch (err) {
    next(err)
  }
}

export async function listOnboardingChecklists(req: Request, res: Response, next: NextFunction) {
  try {
    const checklists = await staffService.listOnboardingChecklists(getSchoolId(req))
    res.json({ data: checklists })
  } catch (err) {
    next(err)
  }
}

export async function getStaffOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const checklist = await staffService.getStaffOnboarding(getSchoolId(req), String(req.params.id))
    res.json({ data: checklist })
  } catch (err) {
    next(err)
  }
}

export async function createOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const checklist = await staffService.createOnboarding(getSchoolId(req), String(req.params.id), req.body as CreateOnboardingInput)
    res.status(201).json({ data: checklist })
  } catch (err) {
    next(err)
  }
}

export async function updateOnboardingTask(req: Request, res: Response, next: NextFunction) {
  try {
    const checklist = await staffService.updateOnboardingTask(
      getSchoolId(req),
      String(req.params.id),
      String(req.params.taskId),
      req.body as UpdateOnboardingTaskInput,
    )
    res.json({ data: checklist })
  } catch (err) {
    next(err)
  }
}

// ==================== Exit Interviews ====================

export async function listExitInterviews(req: Request, res: Response, next: NextFunction) {
  try {
    const interviews = await staffService.listExitInterviews(getSchoolId(req))
    res.json({ data: interviews })
  } catch (err) {
    next(err)
  }
}

export async function getExitInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await staffService.getExitInterview(getSchoolId(req), String(req.params.id))
    res.json({ data: interview })
  } catch (err) {
    next(err)
  }
}

export async function createExitInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await staffService.createExitInterview(getSchoolId(req), String(req.params.id), req.body as CreateExitInterviewInput)
    res.status(201).json({ data: interview })
  } catch (err) {
    next(err)
  }
}

export async function updateExitInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await staffService.updateExitInterview(getSchoolId(req), String(req.params.id), req.body as UpdateExitInterviewInput)
    res.json({ data: interview })
  } catch (err) {
    next(err)
  }
}

export async function updateClearance(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await staffService.updateClearance(
      getSchoolId(req),
      String(req.params.id),
      String(req.params.department),
      req.body as UpdateClearanceInput,
    )
    res.json({ data: interview })
  } catch (err) {
    next(err)
  }
}

// ==================== Bulk ====================

export async function bulkImport(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await staffService.bulkImportStaff(getSchoolId(req), req.body as BulkImportStaffInput)
    res.status(201).json({ data: results })
  } catch (err) {
    next(err)
  }
}

export async function exportStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.exportStaff(getSchoolId(req))
    res.json({ data: staff })
  } catch (err) {
    next(err)
  }
}
