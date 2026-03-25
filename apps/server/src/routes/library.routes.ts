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

// ==================== Books ====================
router.get('/books', adminRoles, libraryController.listBooks)
router.get('/books/:id', adminRoles, libraryController.getBook)
router.post('/books', adminRoles, libraryController.createBook)
router.patch('/books/:id', adminRoles, libraryController.updateBook)
router.delete('/books/:id', adminRoles, libraryController.deleteBook)

export default router
