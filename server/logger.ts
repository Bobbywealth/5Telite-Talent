/**
 * Simple logging utility for the application
 * Provides structured logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
    level?: LogLevel;
    context?: string;
    data?: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV !== 'production';

    private formatMessage(level: LogLevel, message: string, context?: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? `[${context}]` : '';
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';

        return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${dataStr}`;
    }

    debug(message: string, options?: Omit<LogOptions, 'level'>): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('debug', message, options?.context, options?.data));
        }
    }

    info(message: string, options?: Omit<LogOptions, 'level'>): void {
        console.log(this.formatMessage('info', message, options?.context, options?.data));
    }

    warn(message: string, options?: Omit<LogOptions, 'level'>): void {
        console.warn(this.formatMessage('warn', message, options?.context, options?.data));
    }

    error(message: string, error?: Error | any, options?: Omit<LogOptions, 'level'>): void {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;

        console.error(this.formatMessage('error', message, options?.context, errorData || options?.data));
    }

    // Convenience method for database operations
    db(message: string, data?: any): void {
        this.debug(message, { context: 'DATABASE', data });
    }

    // Convenience method for API operations
    api(message: string, data?: any): void {
        this.debug(message, { context: 'API', data });
    }

    // Convenience method for email operations
    email(message: string, data?: any): void {
        this.info(message, { context: 'EMAIL', data });
    }

    // Convenience method for auth operations
    auth(message: string, data?: any): void {
        this.debug(message, { context: 'AUTH', data });
    }
}

export const logger = new Logger();
