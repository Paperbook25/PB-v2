import { Annotation, MessagesAnnotation } from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import type { StructuredToolInterface } from '@langchain/core/tools'

// ─── Role type (mirrors rbac.middleware) ─────────────────────────
export type Role =
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'librarian'
  | 'transport_manager'
  | 'student'
  | 'parent'

// ─── User context extracted from JWT ─────────────────────────────
export interface UserContext {
  userId: string
  role: Role
  name: string
  email: string
}

// ─── Tool classification ─────────────────────────────────────────
export type ToolClassification = 'READ_ONLY' | 'WRITE'

export interface AgentTool {
  tool: StructuredToolInterface
  classification: ToolClassification
  allowedRoles: Role[]
}

// ─── Guardrail result ────────────────────────────────────────────
export interface GuardrailResult {
  approved: boolean
  reason?: string
  blockedTools?: string[]
}

// ─── Pending approval (future WRITE tools) ───────────────────────
export interface PendingApproval {
  toolCallId: string
  toolName: string
  args: Record<string, unknown>
}

// ─── LangGraph State Annotation ──────────────────────────────────
export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,

  toolCalls: Annotation<ToolCall[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  guardrailResult: Annotation<GuardrailResult>({
    reducer: (_prev, next) => next,
    default: () => ({ approved: true }),
  }),

  pendingApprovals: Annotation<PendingApproval[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  iterationCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),

  shouldEnd: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),

  userContext: Annotation<UserContext>({
    reducer: (_prev, next) => next,
    default: () => ({ userId: '', role: 'student' as Role, name: '', email: '' }),
  }),
})

export type AgentStateType = typeof AgentState.State

// ─── Tool call shape (from LLM response) ────────────────────────
export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

// ─── Agent configuration ─────────────────────────────────────────
export interface AgentConfig {
  id: string
  name: string
  description: string
  systemPrompt: string
  allowedRoles: Role[]
  tools: AgentTool[]
  maxIterations?: number
}

// ─── SSE stream chunk types ──────────────────────────────────────
export type StreamChunk =
  | { type: 'text'; content: string }
  | { type: 'tool_start'; toolName: string }
  | { type: 'tool_result'; toolName: string; toolResult: unknown }
  | { type: 'error'; content: string }
  | { type: 'approval_required'; pendingApprovals: PendingApproval[] }

// ─── Role → Tool access matrix ──────────────────────────────────
export const ROLE_TOOL_ACCESS: Record<Role, string[]> = {
  admin: ['*'],
  principal: ['*'],
  teacher: [
    'search_students',
    'get_student_details',
    'get_student_count',
    'get_attendance_summary',
    'get_student_attendance',
    'get_staff_attendance',
    'get_calendar_events',
    'get_upcoming_events',
    'get_class_timetable',
    'get_teacher_timetable',
  ],
  accountant: [
    'search_students',
    'get_student_count',
    'list_fee_structures',
    'get_fee_collection_summary',
    'list_expenses',
  ],
  librarian: [],
  transport_manager: [],
  student: [
    'get_calendar_events',
    'get_upcoming_events',
    'get_class_timetable',
  ],
  parent: [
    'search_students',
    'get_student_details',
    'get_student_attendance',
    'get_calendar_events',
    'get_upcoming_events',
    'get_class_timetable',
  ],
}

// ─── PII fields to redact per role ───────────────────────────────
export const ROLE_PII_REDACTIONS: Record<Role, string[]> = {
  admin: [],
  principal: [],
  teacher: ['salary', 'bankDetails', 'parentPhone', 'basicSalary', 'ctc'],
  accountant: ['healthRecord', 'medicalConditions', 'allergies', 'medications'],
  librarian: ['salary', 'bankDetails', 'phone', 'email', 'address', 'dateOfBirth'],
  transport_manager: ['salary', 'bankDetails', 'phone', 'email', 'address', 'dateOfBirth'],
  student: ['salary', 'bankDetails', 'phone', 'email', 'address', 'dateOfBirth', 'basicSalary', 'ctc'],
  parent: ['salary', 'bankDetails', 'basicSalary', 'ctc'],
}
