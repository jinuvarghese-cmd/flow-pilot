import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../utils/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CLIENT']).default('STAFF'),
  tenantId: z.string(),
});

export async function registerUserRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all users
  fastify.get('/api/users', { preHandler: requireAuth() }, async (request, reply) => {
      const user = request.user;
      const users = await prisma.user.findMany({
        where:{
          tenantId: user.tenantId,
        }
      });

      return { success: true, data: users };
  });

  // Get user by ID
  fastify.get('/api/users/:id', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;
    const {id} = request.params as {id: string};

    const targetUser = await prisma.user.findFirst({
      where:{
        id,
        tenantId: user.tenantId,
      }
    });

    if(!targetUser){
      return reply.status(404).send({ success: false, error: 'User not found' });
    }

    return { success: true, data: targetUser };
  });

  // Create user
  fastify.post('/api/users', { preHandler: requireAuth('ADMIN') }, async (request, reply) => {
    const user = request.user;
    const body = createUserSchema.parse(request.body);

    if(body.tenantId !== user.tenantId){
      return reply.status(403).send({ success: false, error: 'Cannot create user for a different tenant' });
    }
    
    const newUser = await prisma.user.create({
      data: body
    })

    return reply.status(201).send({ success: true, data: newUser });
  });
}