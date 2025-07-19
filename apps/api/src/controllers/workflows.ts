import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tenantId: z.string(),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
  steps: z.any(), // You can refine this with a more specific schema if needed
});

export async function registerWorkflowRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all workflows
  fastify.get('/api/workflows', async (request, reply) => {
    try {
      const workflows = await prisma.workflow.findMany();
      return { success: true, data: workflows };
    } catch (error) {
      fastify.log.error('Error fetching workflows:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Get workflow by ID
  fastify.get('/api/workflows/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const workflow = await prisma.workflow.findUnique({ where: { id } });
      if (!workflow) {
        return reply.status(404).send({ success: false, error: 'Workflow not found' });
      }
      return { success: true, data: workflow };
    } catch (error) {
      fastify.log.error('Error fetching workflow:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Create workflow
  fastify.post('/api/workflows', async (request, reply) => {
    try {
      const body = createWorkflowSchema.parse(request.body);
      const workflow = await prisma.workflow.create({ data: body });
      return reply.status(201).send({ success: true, data: workflow });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: 'Validation error', details: error.errors });
      }
      fastify.log.error('Error creating workflow:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });
}