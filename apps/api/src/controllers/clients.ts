import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const createClientSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).default('LEAD'),
  metadata: z.any().default({}),
});

export async function registerClientRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all clients
  fastify.get('/api/clients', async (request, reply) => {
    try {
      const clients = await prisma.client.findMany();
      return { success: true, data: clients };
    } catch (error) {
      fastify.log.error('Error fetching clients:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Get client by ID
  fastify.get('/api/clients/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const client = await prisma.client.findUnique({ where: { id } });
      if (!client) {
        return reply.status(404).send({ success: false, error: 'Client not found' });
      }
      return { success: true, data: client };
    } catch (error) {
      fastify.log.error('Error fetching client:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Create client
  fastify.post('/api/clients', async (request, reply) => {
    try {
      const body = createClientSchema.parse(request.body);
      const client = await prisma.client.create({ data: body });
      return reply.status(201).send({ success: true, data: client });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: 'Validation error', details: error.errors });
      }
      fastify.log.error('Error creating client:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });
}