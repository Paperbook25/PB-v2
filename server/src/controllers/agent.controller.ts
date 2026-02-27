import type { Request, Response, NextFunction } from 'express'
import { agentRegistry } from '../agents/registry.js'
import { streamAgent } from '../agents/base-agent.js'
import type { Role, UserContext, StreamChunk } from '../agents/types.js'

// Ensure executive assistant is registered
import '../agents/executive-assistant.agent.js'

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, agentId = 'executive-assistant' } = req.body as {
      message: string
      agentId?: string
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required' })
      return
    }

    const config = agentRegistry.get(agentId)
    if (!config) {
      res.status(404).json({ error: `Agent "${agentId}" not found` })
      return
    }

    // Check agent-level role access
    const userRole = req.user!.role as Role
    if (!config.allowedRoles.includes(userRole)) {
      res.status(403).json({ error: `Your role (${userRole}) does not have access to this agent` })
      return
    }

    const userContext: UserContext = {
      userId: req.user!.userId,
      role: userRole,
      name: req.user!.name,
      email: req.user!.email,
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const onChunk = (chunk: StreamChunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }

    await streamAgent(config, message, userContext, onChunk, req.ip || req.socket.remoteAddress)

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    if (!res.headersSent) {
      next(error)
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'An unexpected error occurred' })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}

export async function listAgents(req: Request, res: Response, next: NextFunction) {
  try {
    const userRole = req.user!.role as Role
    const agents = agentRegistry.listByRole(userRole).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    }))
    res.json({ data: agents })
  } catch (err) {
    next(err)
  }
}
