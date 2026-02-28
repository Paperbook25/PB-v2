import { useEffect, useState, useCallback, useRef } from 'react'
import {
  WebSocketService,
  WebSocketState,
  WebSocketMessage,
  getTransportWebSocket,
  getAttendanceWebSocket,
  getNotificationWebSocket,
} from '@/lib/websocket'

type ServiceType = 'transport' | 'attendance' | 'notifications'

interface UseWebSocketOptions {
  /**
   * Which WebSocket service to use
   */
  service: ServiceType
  /**
   * Whether to auto-connect on mount
   */
  autoConnect?: boolean
  /**
   * Callback when connection state changes
   */
  onStateChange?: (state: WebSocketState) => void
  /**
   * Callback for all messages
   */
  onMessage?: (message: WebSocketMessage) => void
}

interface UseWebSocketReturn {
  /**
   * Current connection state
   */
  state: WebSocketState
  /**
   * Whether currently connected
   */
  isConnected: boolean
  /**
   * Connect to WebSocket server
   */
  connect: () => void
  /**
   * Disconnect from WebSocket server
   */
  disconnect: () => void
  /**
   * Send a message
   */
  send: <T>(type: string, payload: T) => void
  /**
   * Subscribe to a specific message type
   */
  subscribe: <T>(type: string, handler: (message: WebSocketMessage<T>) => void) => () => void
}

function getService(type: ServiceType): WebSocketService {
  switch (type) {
    case 'transport':
      return getTransportWebSocket()
    case 'attendance':
      return getAttendanceWebSocket()
    case 'notifications':
      return getNotificationWebSocket()
  }
}

/**
 * Hook for using WebSocket in React components
 *
 * @example
 * ```tsx
 * function LiveTracking() {
 *   const { state, isConnected, subscribe, connect } = useWebSocket({
 *     service: 'transport',
 *     autoConnect: true,
 *   })
 *
 *   useEffect(() => {
 *     const unsubscribe = subscribe<VehicleLocation>('vehicle:location', (msg) => {
 *       setLocation(msg.payload)
 *     })
 *     return unsubscribe
 *   }, [subscribe])
 *
 *   return (
 *     <div>
 *       {isConnected ? 'Connected' : 'Disconnected'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { service, autoConnect = false, onStateChange, onMessage } = options

  const wsRef = useRef<WebSocketService>(getService(service))
  const [state, setState] = useState<WebSocketState>(wsRef.current.getState())

  // Connect on mount if autoConnect is true
  useEffect(() => {
    const ws = wsRef.current

    // Subscribe to state changes
    const unsubState = ws.onStateChange((newState) => {
      setState(newState)
      onStateChange?.(newState)
    })

    // Subscribe to all messages if handler provided
    let unsubMessage: (() => void) | undefined
    if (onMessage) {
      unsubMessage = ws.onMessage(onMessage)
    }

    // Auto connect
    if (autoConnect) {
      ws.connect()
    }

    return () => {
      unsubState()
      unsubMessage?.()
    }
  }, [autoConnect, onStateChange, onMessage])

  const connect = useCallback(() => {
    wsRef.current.connect()
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current.disconnect()
  }, [])

  const send = useCallback(<T,>(type: string, payload: T) => {
    wsRef.current.send(type, payload)
  }, [])

  const subscribe = useCallback(
    <T,>(type: string, handler: (message: WebSocketMessage<T>) => void) => {
      return wsRef.current.on<T>(type, handler)
    },
    []
  )

  return {
    state,
    isConnected: state === 'connected',
    connect,
    disconnect,
    send,
    subscribe,
  }
}

// ==================== TYPED HOOKS FOR SPECIFIC SERVICES ====================

// Transport-specific types
export interface VehicleLocation {
  vehicleId: string
  lat: number
  lng: number
  speed: number
  heading: number
  timestamp: string
}

export interface TransportAlert {
  vehicleId: string
  type: 'breakdown' | 'delay' | 'route_deviation' | 'emergency'
  message: string
  timestamp: string
}

/**
 * Hook for transport live tracking
 */
export function useTransportWebSocket() {
  const ws = useWebSocket({ service: 'transport' })

  const subscribeToVehicle = useCallback(
    (vehicleId: string, handler: (location: VehicleLocation) => void) => {
      return ws.subscribe<VehicleLocation>(`vehicle:${vehicleId}:location`, (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  const subscribeToAllVehicles = useCallback(
    (handler: (location: VehicleLocation) => void) => {
      return ws.subscribe<VehicleLocation>('vehicles:location', (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  const subscribeToAlerts = useCallback(
    (handler: (alert: TransportAlert) => void) => {
      return ws.subscribe<TransportAlert>('transport:alert', (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  return {
    ...ws,
    subscribeToVehicle,
    subscribeToAllVehicles,
    subscribeToAlerts,
  }
}

// Attendance-specific types
export interface AttendanceUpdate {
  studentId: string
  studentName: string
  class: string
  section: string
  status: 'present' | 'absent' | 'late'
  timestamp: string
  method: 'manual' | 'biometric' | 'rfid'
}

export interface AttendanceSummary {
  class: string
  section: string
  present: number
  absent: number
  late: number
  total: number
  percentage: number
}

/**
 * Hook for attendance real-time updates
 */
export function useAttendanceWebSocket() {
  const ws = useWebSocket({ service: 'attendance' })

  const subscribeToClass = useCallback(
    (classId: string, handler: (update: AttendanceUpdate) => void) => {
      return ws.subscribe<AttendanceUpdate>(`class:${classId}:attendance`, (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  const subscribeToSummary = useCallback(
    (handler: (summary: AttendanceSummary) => void) => {
      return ws.subscribe<AttendanceSummary>('attendance:summary', (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  return {
    ...ws,
    subscribeToClass,
    subscribeToSummary,
  }
}

// Notification types
export interface RealtimeNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  actionUrl?: string
  timestamp: string
}

/**
 * Hook for real-time notifications
 */
export function useNotificationWebSocket() {
  const ws = useWebSocket({ service: 'notifications' })

  const subscribeToNotifications = useCallback(
    (handler: (notification: RealtimeNotification) => void) => {
      return ws.subscribe<RealtimeNotification>('notification', (msg) => {
        handler(msg.payload)
      })
    },
    [ws]
  )

  return {
    ...ws,
    subscribeToNotifications,
  }
}
