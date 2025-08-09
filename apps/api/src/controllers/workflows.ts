import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { workflowExecutor } from '../services/workflow-executor';
import { realtimeService } from '../services/realtime';
import { z } from 'zod';
import { requireAuth , AuthenticatedUser} from '../utils/auth';
import { logger } from '../utils/logger';

declare module 'fastify'{
  interface FastifyRequest{
    user: AuthenticatedUser;
  }
}

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  steps: z.any(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  steps: z.any().optional(),
});

const executeWorkflowSchema = z.object({
  data: z.record(z.any()).default({}),
});

export async function registerWorkflowRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all workflows for the current users tenant
  fastify.get('/api/workflows', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const workflows = await prisma.workflow.findMany({
        where:{
          tenantId: user.tenantId,
        },
        include: {
          creator:{
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return { success: true, data: workflows };
    } catch (error) {
      logger.error('Error fetching workflows:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch workflows' });
    }
  });

  // Get workflow by ID
  fastify.get('/api/workflows/:id', { preHandler: requireAuth() }, async (request, reply) => {
    try{
    const user = request.user;
    const { id } = request.params as { id: string };
      const workflow = await prisma.workflow.findFirst({ 
        where: { 
          id, 
          tenantId: user.tenantId 
        } ,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      if (!workflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }
      return { success: true, data: workflow };
    }catch(error){
      logger.error('Error fetching workflow:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch workflow' });
    }
  });

  // Create workflow
  fastify.post('/api/workflows', { preHandler: requireAuth() }, async (request, reply) => {

    try{
      const user = request.user;
      const body = createWorkflowSchema.parse(request.body);

      const workflow = await prisma.workflow.create({
        data:{
          name: body.name,
          description: body.description,
          steps: body.steps,
          isActive: body.isActive,
          tenantId: user.tenantId,
          createdBy: user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if(realtimeService){
        realtimeService.broadcastToTenant(user.tenantId, 'workflow_created', workflow);
      }
      return reply.status(201).send({ success: true, data: workflow });
    }catch(error){
      logger.error('Error creating workflow:', error);
      return reply.status(500).send({ success: false, error: 'Failed to create workflow' });
    }
  });
   
  fastify.put('/api/workflows/:id', { preHandler: requireAuth() }, async (request, reply) => {
    try{
      const user = request.user;
      const { id } = request.params as { id: string };
      const body = updateWorkflowSchema.parse(request.body);

      // Check if workflow exists and belongs to user's tenant
      const existingWorkflow = await prisma.workflow.findFirst({
        where: { 
          id, 
          tenantId: user.tenantId
        }
      });

      if (!existingWorkflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }

      const workflow = await prisma.workflow.update({
        where: { id },
        data: body,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Notify real-time clients
      if (realtimeService) {
        realtimeService.broadcastToTenant(user.tenantId, 'workflow_updated', workflow);
      }
    }catch(error){
      logger.error('Error updating workflow:', error);
      return reply.status(500).send({ success: false, error: 'Failed to update workflow' });
    }
  });

  fastify.delete('/api/workflows/:id', {preHandler: requireAuth()}, async (request, reply) =>{
    try {
      const user = request.user;
      const { id } = request.params as { id: string };

      // Check if workflow exists and belongs to user's tenant
      const existingWorkflow = await prisma.workflow.findFirst({
        where: { id, tenantId: user.tenantId }
      });

      if (!existingWorkflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }

      await prisma.workflow.delete({
        where: { id }
      });
      
      // Notify real-time clients
      if (realtimeService) {
        realtimeService.broadcastToTenant(user.tenantId, 'workflow_deleted', { id });
      }
      return { success: true, message: 'Workflow deleted successfully' };

    } catch (error) {
      logger.error('Error deleting workflow:', error);
      return reply.status(500).send({ success: false, error: 'Failed to delete workflow' });
    }
  } )

  // Execute workflow
  fastify.post('/api/workflows/:id/execute', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const { id } = request.params as { id: string };
      const body = executeWorkflowSchema.parse(request.body);

      // Check if workflow exists and belongs to user's tenant
      const workflow = await prisma.workflow.findFirst({
        where: { id, tenantId: user.tenantId, isActive: true }
      });

      if (!workflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found or inactive' });
      }
      const execution = await workflowExecutor.executeWorkflow(id, user.tenantId, body.data);

      // Notify real-time clients
      if (realtimeService) {
        realtimeService.broadcastToTenant(user.tenantId, 'workflow_execution_started', execution);
      }

      return { success: true, data: execution };

    } catch (error) {
      logger.error('Error executing workflow:', error);
      return reply.status(500).send({ success: false, error: 'Failed to execute workflow' });
    }
  });

  // Get workflow executions
  fastify.get('/api/workflows/:id/executions', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const { id } = request.params as { id: string };

      // Check if workflow exists and belongs to user's tenant
      const workflow = await prisma.workflow.findFirst({
        where: { id, tenantId: user.tenantId }
      });

      if (!workflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }

      const executions = await prisma.workflowExecution.findMany({
        where: { workflowId: id, tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50 executions
      });

      return { success: true, data: executions };
    } catch (error) {
      logger.error('Error fetching workflow executions:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch workflow executions' });
    }
  });

  // Get execution status
  fastify.get('/api/executions/:id', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const { id } = request.params as { id: string };

      const execution = await prisma.workflowExecution.findFirst({
        where: { id, tenantId: user.tenantId },
        include: { 
          workflow: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      });

      if (!execution) {
        return reply.status(404).send({ success: false, error: 'Execution not found' });
      }

      return { success: true, data: execution };
    } catch (error) {
      logger.error('Error fetching execution:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch execution' });
    }
  });

  // Cancel execution
  fastify.post('/api/executions/:id/cancel', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const { id } = request.params as { id: string };

      // Check if execution exists and belongs to user's tenant
      const execution = await prisma.workflowExecution.findFirst({
        where: { id, tenantId: user.tenantId }
      });

      if (!execution) {
        return reply.status(404).send({ success: false, error: 'Execution not found' });
      }

      if (execution.status === 'COMPLETED' || execution.status === 'FAILED' || execution.status === 'CANCELLED') {
        return reply.status(400).send({ success: false, error: 'Cannot cancel completed execution' });
      }

      await workflowExecutor.cancelExecution(id);

      // Notify real-time clients
      if (realtimeService) {
        realtimeService.broadcastToTenant(user.tenantId, 'workflow_execution_cancelled', { id });
      }

      return { success: true, message: 'Execution cancelled successfully' };
    } catch (error) {
      logger.error('Error cancelling execution:', error);
      return reply.status(500).send({ success: false, error: 'Failed to cancel execution' });
    }
  });

  fastify.get('/api/executions', { preHandler: requireAuth() }, async (request, reply) => {
    try {
      const user = request.user;
      const { status, limit = '20', offset = '0' } = request.query as any;

      const where: any = { tenantId: user.tenantId };
      if (status) {
        where.status = status;
      }

      const executions = await prisma.workflowExecution.findMany({
        where,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      const total = await prisma.workflowExecution.count({ where });

      return { 
        success: true, 
        data: executions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      };
    } catch (error) {
      logger.error('Error fetching executions:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch executions' });
    }
  });
}