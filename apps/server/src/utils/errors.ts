export class AppError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly fields?: Record<string, string[]>

  constructor(
    message: string,
    statusCode: number = 500,
    options?: { code?: string; fields?: Record<string, string[]> }
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = options?.code
    this.fields = options?.fields
  }

  static badRequest(message: string, fields?: Record<string, string[]>) {
    return new AppError(message, 400, { code: 'BAD_REQUEST', fields })
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401, { code: 'UNAUTHORIZED' })
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, { code: 'FORBIDDEN' })
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, { code: 'NOT_FOUND' })
  }

  static conflict(message: string) {
    return new AppError(message, 409, { code: 'CONFLICT' })
  }

  static validation(message: string, fields?: Record<string, string[]>) {
    return new AppError(message, 422, { code: 'VALIDATION_ERROR', fields })
  }
}
