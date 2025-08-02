import pino from 'pino';

export default function createLogger() {
    return pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development'
         ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
           }
        : undefined,
        // Add useful metadata
        base: {
            env: process.env.NODE_ENV,
            service: 'flow-pilot-api',
        },
        // Add timestamp
        timestamp: pino.stdTimeFunctions.isoTime,
        // Add request ID for tracing
        mixin() {
            return {
                requestId: process.env.REQUEST_ID || 'unknown'
            }
        }
    })
}

// Create and export a logger instance
export const logger = createLogger();

// Export the function for custom loggers
export { createLogger };