import { Router } from 'express'
import * as hostelController from '../controllers/hostel.controller.js'
import * as hostelService from '../services/hostel.service.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All hostel routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal')

// ==================== Stats ====================
router.get('/stats', adminRoles, hostelController.getHostelStats)

// ==================== Hostel CRUD ====================
router.get('/hostels', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.listHostels(req.schoolId!)
    res.json({ data })
  } catch (err) { next(err) }
})
router.get('/hostels/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.getHostelById(req.schoolId!, req.params.id)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/hostels', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.createHostel(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.put('/hostels/:id', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.updateHostel(req.schoolId!, req.params.id, req.body)
    res.json({ data })
  } catch (err) { next(err) }
})
router.delete('/hostels/:id', adminRoles, async (req, res, next) => {
  try {
    const result = await hostelService.deleteHostel(req.schoolId!, req.params.id)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Mess Menu ====================
router.get('/mess-menu', adminRoles, async (req, res, next) => {
  try {
    const hostelId = req.query.hostelId as string | undefined
    const data = await hostelService.getMessMenu(req.schoolId!, hostelId)
    res.json({ data })
  } catch (err) { next(err) }
})
router.put('/mess-menu', adminRoles, async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : req.body
    await hostelService.upsertMessMenuItems(req.schoolId!, items)
    const data = await hostelService.getMessMenu(req.schoolId!, items[0]?.hostelId)
    res.json({ data })
  } catch (err) { next(err) }
})

// ==================== Hostel Attendance ====================
router.get('/attendance', adminRoles, async (req, res, next) => {
  try {
    const { hostelId, date, studentId, page, limit } = req.query
    const result = await hostelService.listHostelAttendance(req.schoolId!, {
      hostelId: hostelId as string | undefined,
      date: date as string | undefined,
      studentId: studentId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/attendance', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.markHostelAttendance(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.post('/attendance/bulk', adminRoles, async (req, res, next) => {
  try {
    const { hostelId, date, records } = req.body
    const result = await hostelService.bulkMarkHostelAttendance(req.schoolId!, hostelId, date, records)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Hostel Fees ====================
router.get('/fees', adminRoles, async (req, res, next) => {
  try {
    const { hostelId, studentId, status, month, year, page, limit } = req.query
    const result = await hostelService.listHostelFees(req.schoolId!, {
      hostelId: hostelId as string | undefined,
      studentId: studentId as string | undefined,
      status: status as string | undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (err) { next(err) }
})
router.post('/fees', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.createHostelFee(req.schoolId!, req.body)
    res.status(201).json({ data })
  } catch (err) { next(err) }
})
router.patch('/fees/:id/pay', adminRoles, async (req, res, next) => {
  try {
    const data = await hostelService.payHostelFee(req.schoolId!, req.params.id, req.body.paymentRef)
    res.json({ data })
  } catch (err) { next(err) }
})
router.post('/fees/bulk-generate', adminRoles, async (req, res, next) => {
  try {
    const { hostelId, month, year, amount, dueDate } = req.body
    const result = await hostelService.generateBulkHostelFees(req.schoolId!, hostelId, month, year, amount, dueDate)
    res.json(result)
  } catch (err) { next(err) }
})

// ==================== Eligible Students ====================
router.get('/eligible-students', adminRoles, hostelController.getEligibleStudents)

// ==================== Allocations ====================
router.get('/allocations', adminRoles, hostelController.listAllocations)
router.post('/allocations', adminRoles, hostelController.allocateStudent)
router.patch('/allocations/:id/vacate', adminRoles, hostelController.vacateStudent)
router.patch('/allocations/:id/transfer', adminRoles, async (req, res, next) => {
  try {
    const { prisma } = await import('../config/db.js')
    const allocation = await prisma.hostelAllocation.findFirst({
      where: { id: req.params.id, organizationId: req.schoolId! },
    })
    if (!allocation) { res.status(404).json({ error: 'Allocation not found' }); return }
    // HostelAllocation only has roomId — transfer updates the room assignment
    const newRoomId = (req.body.newRoomId as string | undefined) ?? allocation.roomId
    const updated = await prisma.hostelAllocation.update({
      where: { id: req.params.id },
      data: { roomId: newRoomId },
    })
    res.json({ data: updated })
  } catch (err) { next(err) }
})

// ==================== Rooms ====================
router.get('/rooms', adminRoles, hostelController.listRooms)
router.get('/rooms/:id', adminRoles, hostelController.getRoom)
router.post('/rooms', adminRoles, hostelController.createRoom)
router.patch('/rooms/:id', adminRoles, hostelController.updateRoom)
router.delete('/rooms/:id', adminRoles, hostelController.deleteRoom)

export default router
