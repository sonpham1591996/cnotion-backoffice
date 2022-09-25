class ApiError extends Error {
  statusCode: number
  // Operational error is a part of runtime and application while programmer errors are bugs you introduce in your codebase
  isOperational: boolean
  stack: string
  constructor(statusCode: number, message: string, isOperational: boolean = true, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.isOperational = isOperational

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError
