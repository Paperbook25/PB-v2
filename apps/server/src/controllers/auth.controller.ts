import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service.js'
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validators.js'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(
      req.body as LoginInput,
      req.headers['user-agent'],
      req.ip || req.socket.remoteAddress
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.body.refreshToken
    await authService.logout(req.user!.userId, refreshToken)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshTokens(
      req.body.refreshToken,
      req.headers['user-agent'],
      req.ip || req.socket.remoteAddress
    )
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body as ForgotPasswordInput)
    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.body as ResetPasswordInput)
    res.json({ success: true, message: 'Password has been reset successfully.' })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, _next: NextFunction) {
  // req.user is populated by schoolAuthMiddleware with the correct school-level role
  res.json({
    id: req.user!.userId,
    email: req.user!.email,
    name: req.user!.name,
    role: req.user!.role,
  })
}
