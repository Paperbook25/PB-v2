import { prisma } from '../config/db.js'
import type { Role, UserContext, GuardrailResult, AgentTool, ToolCall } from './types.js'
import { ROLE_TOOL_ACCESS, ROLE_PII_REDACTIONS } from './types.js'

// ─── Layer 1: Input Sanitization ─────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /system\s*:/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<\s*SYS\s*>>/i,
  /\{\{.*system.*\}\}/i,
  /act\s+as\s+(a|an)\s+(unrestricted|evil|hacker)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a|an)/i,
  /do\s+anything\s+now/i,
  /jailbreak/i,
  /bypass\s+(your\s+)?(safety|filter|rules)/i,
]

const SCRIPT_TAG_RE = /<\s*\/?\s*(script|iframe|object|embed|form|input|style)[^>]*>/gi
const MAX_INPUT_LENGTH = 2000

export function sanitizeInput(input: string): { clean: string; blocked: boolean; reason?: string } {
  if (input.length > MAX_INPUT_LENGTH) {
    return { clean: '', blocked: true, reason: `Message too long (max ${MAX_INPUT_LENGTH} characters)` }
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { clean: '', blocked: true, reason: 'Message contains disallowed content' }
    }
  }

  const clean = input.replace(SCRIPT_TAG_RE, '')
  return { clean, blocked: false }
}

// ─── Layer 2: Content Policy ─────────────────────────────────────

const CONTENT_POLICY_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack)\b.*\b(student|child|teacher|kid|people)\b/i,
  /\b(student|child|teacher|kid)\b.*\b(kill|murder|shoot|stab|bomb|attack)\b/i,
  /\b(porn|xxx|nsfw|hentai|explicit)\b/i,
  /\b(hate|racial\s+slur|supremacy|nazi)\b/i,
  /how\s+to\s+(make|build)\s+(a\s+)?(bomb|weapon|explosive|gun)/i,
  /\b(suicide|self[-\s]?harm)\b.*\b(how|method|way)\b/i,
]

export function checkContentPolicy(input: string): { passed: boolean; reason?: string } {
  for (const pattern of CONTENT_POLICY_PATTERNS) {
    if (pattern.test(input)) {
      return { passed: false, reason: 'Message violates content policy for a school environment' }
    }
  }
  return { passed: true }
}

// ─── Layer 3: Role-Based Tool Access ─────────────────────────────

export function validateToolAccess(
  toolCalls: ToolCall[],
  userRole: Role,
  agentTools: AgentTool[],
): GuardrailResult {
  const allowedTools = ROLE_TOOL_ACCESS[userRole]
  if (!allowedTools) {
    return { approved: false, reason: `Unknown role: ${userRole}` }
  }

  // Wildcard means all tools allowed
  const hasWildcard = allowedTools.includes('*')
  const blockedTools: string[] = []

  for (const tc of toolCalls) {
    // Check global role-tool matrix
    if (!hasWildcard && !allowedTools.includes(tc.name)) {
      blockedTools.push(tc.name)
      continue
    }

    // Check tool-level allowedRoles
    const agentTool = agentTools.find((t) => t.tool.name === tc.name)
    if (agentTool && !agentTool.allowedRoles.includes(userRole)) {
      blockedTools.push(tc.name)
    }
  }

  if (blockedTools.length > 0) {
    return {
      approved: false,
      reason: `Your role (${userRole}) does not have access to: ${blockedTools.join(', ')}`,
      blockedTools,
    }
  }

  return { approved: true }
}

// ─── Layer 4: Tool Classification Check ──────────────────────────

export function classifyToolCalls(
  toolCalls: ToolCall[],
  agentTools: AgentTool[],
): { readOnly: ToolCall[]; write: ToolCall[] } {
  const readOnly: ToolCall[] = []
  const write: ToolCall[] = []

  for (const tc of toolCalls) {
    const agentTool = agentTools.find((t) => t.tool.name === tc.name)
    if (agentTool?.classification === 'WRITE') {
      write.push(tc)
    } else {
      readOnly.push(tc)
    }
  }

  return { readOnly, write }
}

// ─── Layer 5: PII Redaction ──────────────────────────────────────

export function deepRedact(data: unknown, fieldsToRedact: string[]): unknown {
  if (fieldsToRedact.length === 0) return data
  if (data === null || data === undefined) return data
  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map((item) => deepRedact(item, fieldsToRedact))
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (fieldsToRedact.includes(key)) {
      result[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deepRedact(value, fieldsToRedact)
    } else {
      result[key] = value
    }
  }
  return result
}

export function redactForRole(data: unknown, role: Role): unknown {
  const fields = ROLE_PII_REDACTIONS[role]
  return deepRedact(data, fields)
}

// ─── Layer 6: Rate Limiting ──────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true }
}

// ─── Audit Logging (fire-and-forget) ─────────────────────────────

export function auditLog(
  user: UserContext,
  action: string,
  details: { module?: string; entityType?: string; entityId?: string; description?: string; changes?: unknown },
  ipAddress?: string,
): void {
  prisma.auditLog
    .create({
      data: {
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        action,
        module: details.module || 'agents',
        entityType: details.entityType || 'agent_chat',
        entityId: details.entityId || '',
        description: details.description || `${action}`,
        changes: details.changes as object | undefined,
        ipAddress: ipAddress || '',
      },
    })
    .catch((err) => console.error('[Agent Audit] Failed:', err))
}
