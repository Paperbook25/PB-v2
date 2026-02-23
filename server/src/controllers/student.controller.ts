import type { Request, Response, NextFunction } from 'express'
import * as studentService from '../services/student.service.js'
import { listStudentsSchema } from '../validators/student.validators.js'
import type {
  CreateStudentInput, UpdateStudentInput, CreateDocumentInput,
  UpsertHealthRecordInput, CreateSkillInput, UpdateSkillInput,
  CreatePortfolioItemInput, UpdatePortfolioItemInput,
  LinkSiblingInput, PromoteStudentsInput, BulkImportStudentsInput,
} from '../validators/student.validators.js'

// ==================== CRUD ====================

export async function listStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listStudentsSchema.parse(req.query)
    const result = await studentService.listStudents(query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.getStudentById(String(req.params.id))
    res.json({ data: student })
  } catch (err) {
    next(err)
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.createStudent(req.body as CreateStudentInput)
    res.status(201).json({ data: student })
  } catch (err) {
    next(err)
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.updateStudent(String(req.params.id), req.body as UpdateStudentInput)
    res.json({ data: student })
  } catch (err) {
    next(err)
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.deleteStudent(String(req.params.id))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== Documents ====================

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await studentService.listDocuments(String(req.params.id))
    res.json({ data: docs })
  } catch (err) {
    next(err)
  }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await studentService.createDocument(
      String(req.params.id),
      req.body as CreateDocumentInput,
      req.user?.name,
    )
    res.status(201).json({ data: doc })
  } catch (err) {
    next(err)
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.deleteDocument(String(req.params.id), String(req.params.docId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function verifyDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await studentService.verifyDocument(
      String(req.params.id),
      String(req.params.docId),
      req.user?.name || 'Unknown',
    )
    res.json({ data: doc })
  } catch (err) {
    next(err)
  }
}

// ==================== Health ====================

export async function getHealthRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await studentService.getHealthRecord(String(req.params.id))
    res.json({ data: record })
  } catch (err) {
    next(err)
  }
}

export async function upsertHealthRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await studentService.upsertHealthRecord(
      String(req.params.id),
      req.body as UpsertHealthRecordInput,
    )
    res.json({ data: record })
  } catch (err) {
    next(err)
  }
}

// ==================== Timeline ====================

export async function listTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await studentService.listTimelineEvents(String(req.params.id))
    res.json({ data: events })
  } catch (err) {
    next(err)
  }
}

// ==================== Siblings ====================

export async function getSiblings(req: Request, res: Response, next: NextFunction) {
  try {
    const siblings = await studentService.getSiblings(String(req.params.id))
    res.json({ data: siblings })
  } catch (err) {
    next(err)
  }
}

export async function linkSibling(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.linkSibling(String(req.params.id), req.body as LinkSiblingInput)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function unlinkSibling(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.unlinkSibling(String(req.params.id), String(req.params.siblingId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== ID Card ====================

export async function getIdCard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await studentService.getIdCardData(String(req.params.id))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

// ==================== Skills ====================

export async function addSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await studentService.addSkill(String(req.params.id), req.body as CreateSkillInput)
    res.status(201).json({ data: skill })
  } catch (err) {
    next(err)
  }
}

export async function updateSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const skill = await studentService.updateSkill(
      String(req.params.id),
      String(req.params.skillId),
      req.body as UpdateSkillInput,
    )
    res.json({ data: skill })
  } catch (err) {
    next(err)
  }
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.deleteSkill(String(req.params.id), String(req.params.skillId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== Portfolio ====================

export async function getPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const portfolio = await studentService.getPortfolio(String(req.params.id))
    res.json({ data: portfolio })
  } catch (err) {
    next(err)
  }
}

export async function updatePortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept portfolio updates — for now just return the current portfolio
    const portfolio = await studentService.getPortfolio(String(req.params.id))
    res.json({ data: portfolio })
  } catch (err) {
    next(err)
  }
}

export async function addPortfolioItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await studentService.addPortfolioItem(String(req.params.id), req.body as CreatePortfolioItemInput)
    res.status(201).json({ data: item })
  } catch (err) {
    next(err)
  }
}

export async function updatePortfolioItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await studentService.updatePortfolioItem(
      String(req.params.id),
      String(req.params.itemId),
      req.body as UpdatePortfolioItemInput,
    )
    res.json({ data: item })
  } catch (err) {
    next(err)
  }
}

export async function deletePortfolioItem(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.deletePortfolioItem(String(req.params.id), String(req.params.itemId))
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// ==================== Promotion ====================

export async function promoteStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await studentService.promoteStudents(req.body as PromoteStudentsInput)
    res.json({ data: results })
  } catch (err) {
    next(err)
  }
}

// ==================== Bulk ====================

export async function bulkImport(req: Request, res: Response, next: NextFunction) {
  try {
    let input = req.body
    // Frontend may send { rows: [...] } instead of { students: [...] }
    if (input.rows && !input.students) {
      // Map raw CSV rows to student objects
      input = {
        students: input.rows.map((row: Record<string, string>) => ({
          firstName: row.firstName || row.first_name || (row.name || '').split(' ')[0] || '',
          lastName: row.lastName || row.last_name || (row.name || '').split(' ').slice(1).join(' ') || '',
          email: row.email || '',
          admissionNumber: row.admissionNumber || row.admission_number || '',
          class: row.class || row.className || '',
          section: row.section || '',
          dateOfBirth: row.dateOfBirth || row.date_of_birth || undefined,
          gender: row.gender || undefined,
          phone: row.phone || undefined,
          parentName: row.parentName || row.parent_name || undefined,
          parentPhone: row.parentPhone || row.parent_phone || undefined,
          parentEmail: row.parentEmail || row.parent_email || undefined,
        })),
      }
    }
    const results = await studentService.bulkImportStudents(input as BulkImportStudentsInput)
    res.status(201).json({ data: results })
  } catch (err) {
    next(err)
  }
}

export async function exportStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const students = await studentService.exportStudents()
    res.json({ data: students })
  } catch (err) {
    next(err)
  }
}
