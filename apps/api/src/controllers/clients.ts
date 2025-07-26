import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../utils/auth';

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
  fastify.get('/api/clients', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const clients = await prisma.client.findMany({
      where:{
        tenantId: user.tenantId,
      }
    });
    return { success: true, data: clients };
  });

  // Get client by ID
  fastify.get('/api/clients/:id', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const { id } = request.params as { id: string };

    const client = await prisma.client.findFirst({ 
      where: { 
        id, 
        tenantId: user.tenantId 
      } 
    });

      if (!client) {
        return reply.status(404).send({ success: false, error: 'Client not found' });
      }
      return { success: true, data: client };

  });

  // Create client
  fastify.post('/api/clients', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const body = createClientSchema.parse(request.body);
    if(body.tenantId !== user.tenantId){
      return reply.status(403).send({ success: false, error: 'Cannot create client for a different tenant' });
    }
    const client = await prisma.client.create({ data: body });
    return reply.status(201).send({ success: true, data: client });
  });
}