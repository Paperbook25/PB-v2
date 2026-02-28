import { delay } from 'msw'

// Centralized delay configuration for MSW handlers
type DelayMode = 'none' | 'fast' | 'realistic' | 'slow'

const DELAY_PRESETS: Record<DelayMode, { read: number; write: number; heavy: number }> = {
  // For development - instant feedback
  none: { read: 0, write: 0, heavy: 0 },
  // Fast development mode (recommended)
  fast: { read: 50, write: 100, heavy: 200 },
  // Realistic network simulation
  realistic: { read: 200, write: 300, heavy: 500 },
  // Slow network testing
  slow: { read: 500, write: 800, heavy: 1500 },
}

const getDelayMode = (): DelayMode => {
  const mode = import.meta.env.VITE_MSW_DELAY_MODE as DelayMode | undefined
  if (mode && mode in DELAY_PRESETS) {
    return mode
  }
  return 'realistic'
}

export const DELAYS = DELAY_PRESETS[getDelayMode()]

// Helper function for consistent delay usage
export const mockDelay = async (type: 'read' | 'write' | 'heavy' = 'read') => {
  const ms = DELAYS[type]
  if (ms > 0) {
    await delay(ms)
  }
}
