import { Router } from 'express'
import * as libraryController from '../controllers/library.controller.js'
import { authMiddleware, rbacMiddleware } from '../middleware/index.js'

const router = Router()

// All library routes require auth
router.use(authMiddleware)

const adminRoles = rbacMiddleware('admin', 'principal', 'librarian')

// ==================== Stats ====================
router.get('/stats', adminRoles, libraryController.getLibraryStats)

// ==================== Issues ====================
router.get('/issues', adminRoles, libraryController.listIssues)
router.get('/issues/overdue', adminRoles, libraryController.getOverdueBooks)
router.post('/issues', adminRoles, libraryController.issueBook)
router.patch('/issues/:id/return', adminRoles, libraryController.returnBook)

// ==================== Fines ====================
router.get('/fines', adminRoles, libraryController.listFines)
router.patch('/fines/:id', adminRoles, libraryController.updateFine)
router.delete('/fines/:id', adminRoles, libraryController.deleteFine)

// ==================== Reservations ====================
router.get('/reservations', adminRoles, libraryController.listReservations)
router.post('/reservations', adminRoles, libraryController.createReservation)
router.delete('/reservations/:id', adminRoles, libraryController.cancelReservation)

// ==================== Renewal ====================
router.patch('/issues/:id/renew', adminRoles, libraryController.renewBook)

// ==================== Available Students ====================
router.get('/available-students', adminRoles, libraryController.getAvailableStudents)

// ==================== Books ====================
router.get('/books', adminRoles, libraryController.listBooks)
router.get('/books/:id', adminRoles, libraryController.getBook)
router.post('/books', adminRoles, libraryController.createBook)
router.patch('/books/:id', adminRoles, libraryController.updateBook)
router.delete('/books/:id', adminRoles, libraryController.deleteBook)

export default router
