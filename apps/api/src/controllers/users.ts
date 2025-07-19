import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CLIENT']).default('STAFF'),
  tenantId: z.string(),
});

export async function registerUserRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all users
  fastify.get('/api/users', async (request, reply) => {
    try {
      const users = await prisma.user.findMany();
      return { success: true, data: users };
    } catch (error) {
      fastify.log.error('Error fetching users:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Get user by ID
  fastify.get('/api/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return reply.status(404).send({ success: false, error: 'User not found' });
      }
      return { success: true, data: user };
    } catch (error) {
      fastify.log.error('Error fetching user:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Create user
  fastify.post('/api/users', async (request, reply) => {
    try {
      const body = createUserSchema.parse(request.body);
      const user = await prisma.user.create({ data: body });
      return reply.status(201).send({ success: true, data: user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ success: false, error: 'Validation error', details: error.errors });
      }
      fastify.log.error('Error creating user:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });
}