import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../utils/auth';

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tenantId: z.string(),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
  steps: z.any(), // You can refine this with a more specific schema if needed
});

export async function registerWorkflowRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all workflows for the current users tenant
  fastify.get('/api/workflows', { preHandler: requireAuth() }, async (request, reply) => {
      const user = request.user;
      const workflows = await prisma.workflow.findMany({
        where:{
          tenantId: user.tenantId,
        }
      });
      
      return { success: true, data: workflows };
  });

  // Get workflow by ID
  fastify.get('/api/workflows/:id', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const { id } = request.params as { id: string };
      const workflow = await prisma.workflow.findFirst({ 
        where: { 
          id, 
          tenantId: user.tenantId 
        } 
      });
      if (!workflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }
      return { success: true, data: workflow };
  });

  // Create workflow
  fastify.post('/api/workflows', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const body = createWorkflowSchema.parse(request.body);
    if(body.tenantId !== user.tenantId){
      return reply.status(403).send({ success: false, error: 'Cannot create workflow for a different tenant' });
    }
    
    const workflow = await prisma.workflow.create({ data: body });
    return reply.status(201).send({ success: true, data: workflow });
  });
}