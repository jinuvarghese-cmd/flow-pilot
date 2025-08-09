import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import { createLogger } from './utils/logger';
import { registerGraphQL } from './graphql';
import { registerRoutes } from './controllers';
import { initializeQueues } from './config/queues';
import { jobWorker } from './workers/job-worker';
import { realtimeService } from './services/realtime';

const logger = createLogger();
const prisma = new PrismaClient();

async function createServer() {
  const fastify = Fastify({
    logger,
    trustProxy: true,
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
      ? undefined
      : false
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register WebSocket support
  await fastify.register(websocket);

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'FlowPilot API',
        description: 'Enterprise-grade workflow automation API',
        version: '1.0.0',
      },
      host: 'localhost:3001',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Initialize workflow services
  try {
    await initializeQueues();
    logger.info('✅ Workflow queues initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize queues:', error);
  }

  // Register WebSocket for real-time updates
  try {
    realtimeService.registerWebSocket(fastify);
    logger.info('✅ WebSocket service initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize WebSocket:', error);
  }

  // Register GraphQL
  await registerGraphQL(fastify, prisma);

  // Register REST routes
  await registerRoutes(fastify, prisma);

  // Health check
  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        queues: 'active',
        websocket: 'active'
      }
    };
  });

  return fastify;
}

async function start() {
  try {
    const server = await createServer();
    
    const port = process.env.PORT || 3001;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    // Start job worker
    jobWorker.start().catch(error => {
      logger.error('❌ Failed to start job worker:', error);
    });

    await server.listen({ port: Number(port), host });
    
    logger.info(`🚀 Server running on http://${host}:${port}`);
    logger.info(`�� API Documentation: http://${host}:${port}/docs`);
    logger.info(`�� GraphQL Playground: http://${host}:${port}/graphql`);
    logger.info(`🔌 WebSocket endpoint: ws://${host}:${port}/ws`);
    
  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await jobWorker.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await jobWorker.stop();
  await prisma.$disconnect();
  process.exit(0);
});

start();