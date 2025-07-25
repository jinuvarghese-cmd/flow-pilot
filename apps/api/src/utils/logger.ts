import pino from 'pino';

export function createLogger(){
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
    })
}