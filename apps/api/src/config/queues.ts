import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Queue types
export const QUEUE_TYPES = {
  WORKFLOW_EXECUTION: 'workflow-execution',
  EMAIL_SEND: 'email-send',
  WEBHOOK_TRIGGER: 'webhook-trigger',
  DATA_PROCESSING: 'data-processing',
} as const;

// Job status
export const JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Queue management functions
export class PostgresQueue {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async addJob(type: string, data: any, tenantId: string, options?: {
    delay?: number;
    priority?: number;
  }) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job = await this.prisma.jobQueue.create({
      data: {
        jobId,
        type,
        data,
        status: JOB_STATUS.PENDING,
        progress: 0,
        tenantId,
        // Add delay if specified
        ...(options?.delay && {
          createdAt: new Date(Date.now() + options.delay)
        })
      }
    });

    logger.info(`Job added to queue: ${jobId} (${type})`);
    return job;
  }

  async getNextJob(type: string, tenantId: string) {
    const job = await this.prisma.jobQueue.findFirst({
      where: {
        type,
        status: JOB_STATUS.PENDING,
        tenantId,
        createdAt: {
          lte: new Date() // Only jobs that are ready to run
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (job) {
      // Mark as processing
      await this.prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: JOB_STATUS.PROCESSING }
      });
    }

    return job;
  }

  async updateJobProgress(jobId: string, progress: number, result?: any) {
    await this.prisma.jobQueue.update({
      where: { jobId },
      data: {
        progress,
        ...(result && { result })
      }
    });
  }

  async completeJob(jobId: string, result?: any) {
    await this.prisma.jobQueue.update({
      where: { jobId },
      data: {
        status: JOB_STATUS.COMPLETED,
        progress: 100,
        ...(result && { result })
      }
    });
  }

  async failJob(jobId: string, error: string) {
    await this.prisma.jobQueue.update({
      where: { jobId },
      data: {
        status: JOB_STATUS.FAILED,
        error
      }
    });
  }

  async getJobStatus(jobId: string) {
    return await this.prisma.jobQueue.findUnique({
      where: { jobId }
    });
  }

  async getJobsByTenant(tenantId: string, status?: string) {
    return await this.prisma.jobQueue.findMany({
      where: {
        tenantId,
        ...(status && { status })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

// Create queue instances
export const workflowQueue = new PostgresQueue();
export const emailQueue = new PostgresQueue();
export const webhookQueue = new PostgresQueue();
export const dataProcessingQueue = new PostgresQueue();

// Initialize queues
export async function initializeQueues() {
  try {
    logger.info('✅ PostgreSQL-based queues initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize queues:', error);
    throw error;
  }
}