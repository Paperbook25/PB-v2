import { Router } from 'express'
import { handleMessage } from '../controllers/chatbot.controller.js'
import rateLimit from 'express-rate-limit'

const chatbotPublicRouter = Router()

// Rate limit: 20 requests per minute per IP
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many chat messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

chatbotPublicRouter.post('/', chatRateLimiter, handleMessage)

export { chatbotPublicRouter }
