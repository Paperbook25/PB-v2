/**
 * WebSocket Service
 * Provides real-time communication for live tracking and updates.
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Event-based message handling
 * - Connection state management
 * - Heartbeat/ping-pong to detect disconnections
 */

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: string
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void
type StateChangeHandler = (state: WebSocketState) => void

interface WebSocketServiceConfig {
  url: string
  reconnect?: boolean
  reconnectMaxAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

class WebSocketService {
  private ws: WebSocket | null = null
  private state: WebSocketState = 'disconnected'
  private config: Required<WebSocketServiceConfig>
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  private messageHandlers = new Map<string, Set<MessageHandler>>()
  private stateChangeHandlers = new Set<StateChangeHandler>()
  private globalHandlers = new Set<MessageHandler>()

  constructor(config: WebSocketServiceConfig) {
    this.config = {
      reconnect: true,
      reconnectMaxAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...config,
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.updateState('connecting')

    try {
      this.ws = new WebSocket(this.config.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.updateState('connected')
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage

          // Handle pong response
          if (message.type === 'pong') {
            return
          }

          // Notify type-specific handlers
          const handlers = this.messageHandlers.get(message.type)
          handlers?.forEach((handler) => handler(message))

          // Notify global handlers
          this.globalHandlers.forEach((handler) => handler(message))
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      this.ws.onclose = (event) => {
        this.stopHeartbeat()
        this.updateState('disconnected')

        // Attempt reconnection if not intentionally closed
        if (this.config.reconnect && !event.wasClean) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.updateState('error')
      }
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
      this.updateState('error')
      this.scheduleReconnect()
    }
  }

  disconnect(): void {
    this.stopHeartbeat()
    this.cancelReconnect()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }

    this.updateState('disconnected')
  }

  send<T>(type: string, payload: T): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected')
      return
    }

    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    }

    this.ws.send(JSON.stringify(message))
  }

  /**
   * Subscribe to messages of a specific type
   */
  on<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }

    this.messageHandlers.get(type)!.add(handler as MessageHandler)

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler)
    }
  }

  /**
   * Subscribe to all messages
   */
  onMessage<T = unknown>(handler: MessageHandler<T>): () => void {
    this.globalHandlers.add(handler as MessageHandler)

    return () => {
      this.globalHandlers.delete(handler as MessageHandler)
    }
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler)

    return () => {
      this.stateChangeHandlers.delete(handler)
    }
  }

  getState(): WebSocketState {
    return this.state
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  private updateState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState
      this.stateChangeHandlers.forEach((handler) => handler(newState))
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectMaxAttempts) {
      console.warn('[WebSocket] Max reconnection attempts reached')
      return
    }

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {})
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// Singleton instances for different services
let transportWs: WebSocketService | null = null
let attendanceWs: WebSocketService | null = null
let notificationWs: WebSocketService | null = null

/**
 * Get WebSocket service for transport live tracking
 */
export function getTransportWebSocket(): WebSocketService {
  if (!transportWs) {
    transportWs = new WebSocketService({
      url: import.meta.env.VITE_WS_TRANSPORT_URL || 'wss://api.paperbook.edu/ws/transport',
      reconnect: true,
      heartbeatInterval: 15000, // More frequent for live tracking
    })
  }
  return transportWs
}

/**
 * Get WebSocket service for attendance updates
 */
export function getAttendanceWebSocket(): WebSocketService {
  if (!attendanceWs) {
    attendanceWs = new WebSocketService({
      url: import.meta.env.VITE_WS_ATTENDANCE_URL || 'wss://api.paperbook.edu/ws/attendance',
      reconnect: true,
    })
  }
  return attendanceWs
}

/**
 * Get WebSocket service for notifications
 */
export function getNotificationWebSocket(): WebSocketService {
  if (!notificationWs) {
    notificationWs = new WebSocketService({
      url: import.meta.env.VITE_WS_NOTIFICATIONS_URL || 'wss://api.paperbook.edu/ws/notifications',
      reconnect: true,
    })
  }
  return notificationWs
}

export { WebSocketService }
