/**
 * Structured Logging System
 * Provides consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  requestId?: string
}

class Logger {
  private static instance: Logger
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.requestId ? `[${entry.requestId}]` : '',
      entry.userId ? `[User: ${entry.userId}]` : '',
      entry.message,
    ].filter(Boolean)

    return parts.join(' ')
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userId: context?.userId,
      requestId: context?.requestId,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log WARN and above
    if (!this.isDevelopment) {
      return [LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL].includes(level)
    }
    return true
  }

  private async sendToExternalService(entry: LogEntry) {
    // Send to external logging service (Sentry, CloudWatch, etc.)
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
      try {
        // Example: Send to Sentry
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(entry.error || new Error(entry.message), {
            level: entry.level,
            extra: entry.context,
          })
        }
      } catch (err) {
        console.error('Failed to send log to external service:', err)
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatLog(entry), context || '')
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, message, context)
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatLog(entry), context || '')
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.WARN, message, context)
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog(entry), context || '')
    }
    this.sendToExternalService(entry)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error)
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatLog(entry), error || '', context || '')
    }
    this.sendToExternalService(entry)
  }

  fatal(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error)
    if (this.shouldLog(LogLevel.FATAL)) {
      console.error(this.formatLog(entry), error || '', context || '')
    }
    this.sendToExternalService(entry)
  }

  // Utility for API route logging
  apiLog(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ) {
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO
    
    this.log(level, `API ${method} ${path} - ${status} (${duration}ms)`, {
      ...context,
      method,
      path,
      status,
      duration,
    })
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(level, message, context)
    if (this.shouldLog(level)) {
      const logFn = (console as any)[level] || console.log
      logFn(this.formatLog(entry), context || '')
    }
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      this.sendToExternalService(entry)
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Convenience exports
export const log = {
  debug: (msg: string, ctx?: Record<string, any>) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: Record<string, any>) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error, ctx?: Record<string, any>) => logger.error(msg, err, ctx),
  fatal: (msg: string, err?: Error, ctx?: Record<string, any>) => logger.fatal(msg, err, ctx),
  api: (method: string, path: string, status: number, duration: number, ctx?: Record<string, any>) =>
    logger.apiLog(method, path, status, duration, ctx),
}
