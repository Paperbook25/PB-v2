/**
 * Exam Security Utilities
 *
 * Provides anti-cheating measures for online exams:
 * - Tab visibility detection
 * - Copy/paste prevention
 * - Right-click prevention
 * - Fullscreen management
 */

export interface SecurityViolation {
  type: 'tab_switch' | 'copy_attempt' | 'right_click' | 'fullscreen_exit'
  timestamp: string
}

export interface ExamSecurityConfig {
  preventCopyPaste: boolean
  preventRightClick: boolean
  detectTabSwitch: boolean
  fullScreenRequired: boolean
  onViolation?: (violation: SecurityViolation) => void
}

/**
 * Create a security violation record
 */
export function createViolation(
  type: SecurityViolation['type']
): SecurityViolation {
  return {
    type,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Prevent copy/paste in the document
 */
export function setupCopyPasteProtection(onViolation?: (v: SecurityViolation) => void) {
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault()
    onViolation?.(createViolation('copy_attempt'))
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    onViolation?.(createViolation('copy_attempt'))
  }

  const handleCut = (e: ClipboardEvent) => {
    e.preventDefault()
    onViolation?.(createViolation('copy_attempt'))
  }

  document.addEventListener('copy', handleCopy)
  document.addEventListener('paste', handlePaste)
  document.addEventListener('cut', handleCut)

  return () => {
    document.removeEventListener('copy', handleCopy)
    document.removeEventListener('paste', handlePaste)
    document.removeEventListener('cut', handleCut)
  }
}

/**
 * Prevent right-click context menu
 */
export function setupRightClickProtection(onViolation?: (v: SecurityViolation) => void) {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    onViolation?.(createViolation('right_click'))
  }

  document.addEventListener('contextmenu', handleContextMenu)

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu)
  }
}

/**
 * Detect tab/window visibility changes
 */
export function setupVisibilityDetection(onViolation?: (v: SecurityViolation) => void) {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onViolation?.(createViolation('tab_switch'))
    }
  }

  const handleBlur = () => {
    onViolation?.(createViolation('tab_switch'))
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleBlur)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('blur', handleBlur)
  }
}

/**
 * Request fullscreen mode
 */
export async function requestFullscreen(element: HTMLElement = document.documentElement) {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen()
    }
    return true
  } catch {
    return false
  }
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Check if currently in fullscreen
 */
export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

/**
 * Detect fullscreen changes
 */
export function setupFullscreenDetection(onViolation?: (v: SecurityViolation) => void) {
  const handleFullscreenChange = () => {
    if (!isFullscreen()) {
      onViolation?.(createViolation('fullscreen_exit'))
    }
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)

  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  }
}

/**
 * Setup all security measures based on config
 */
export function setupExamSecurity(config: ExamSecurityConfig) {
  const cleanups: (() => void)[] = []

  if (config.preventCopyPaste) {
    cleanups.push(setupCopyPasteProtection(config.onViolation))
  }

  if (config.preventRightClick) {
    cleanups.push(setupRightClickProtection(config.onViolation))
  }

  if (config.detectTabSwitch) {
    cleanups.push(setupVisibilityDetection(config.onViolation))
  }

  if (config.fullScreenRequired) {
    cleanups.push(setupFullscreenDetection(config.onViolation))
    requestFullscreen()
  }

  // Also prevent some keyboard shortcuts
  const handleKeydown = (e: KeyboardEvent) => {
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X
    if (config.preventCopyPaste && (e.ctrlKey || e.metaKey)) {
      if (['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        config.onViolation?.(createViolation('copy_attempt'))
      }
    }

    // Prevent PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault()
    }

    // Prevent F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault()
    }
  }

  document.addEventListener('keydown', handleKeydown)
  cleanups.push(() => document.removeEventListener('keydown', handleKeydown))

  // Return cleanup function
  return () => {
    cleanups.forEach((cleanup) => cleanup())
    if (config.fullScreenRequired && isFullscreen()) {
      exitFullscreen()
    }
  }
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Check if exam is within scheduled time window
 */
export function isWithinSchedule(schedule?: {
  startTime: string
  endTime: string
}): { allowed: boolean; message?: string } {
  if (!schedule) {
    return { allowed: true }
  }

  const now = new Date()
  const start = new Date(schedule.startTime)
  const end = new Date(schedule.endTime)

  if (now < start) {
    return {
      allowed: false,
      message: `Exam starts on ${start.toLocaleString()}`,
    }
  }

  if (now > end) {
    return {
      allowed: false,
      message: `Exam ended on ${end.toLocaleString()}`,
    }
  }

  return { allowed: true }
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}
