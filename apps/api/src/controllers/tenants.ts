import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getUserFromToken } from '../utils/auth';
import { requireAuth } from '../utils/auth';

const createTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).default('FREE'),
  settings: z.object({
    branding: z.object({
      primaryColor: z.string().default('#3B82F6'),
      companyName: z.string(),
    }),
    features: z.object({
      workflows: z.boolean().default(true),
      automations: z.boolean().default(false),
      clientPortal: z.boolean().default(false),
      aiAssistant: z.boolean().default(false),
    }),
  }),
});

export async function registerTenantRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get all tenants for the current user
  fastify.get('/api/tenants', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;

      const tenants = await prisma.tenant.findMany({
        where: {
            users: {
                some: {
                    id: user.id,
                },
            },
        },
        include: {
          _count: {
            select: {
              users: true,
              workflows: true,
              clients: true,
            },
          },
        },
      });
      
      return { success: true, data: tenants };

  });

  // Get tenant by ID
  fastify.get('/api/tenants/:id', { preHandler: requireAuth() }, async (request, reply) => {
    const user = request.user;

    const { id } = request.params as { id: string };
    
      const tenant = await prisma.tenant.findFirst({
        where:  {
          users: {
              some: {
                  id: user.id,
              },
          },
        },
        include: {
          users: true,
          workflows: true,
          clients: true,
          documents: true,
        },
      });
      
      if (!tenant) {
        return reply.status(404).send({ success: false, error: 'Tenant not found' });
      }
      
      return { success: true, data: tenant };
  });

  // Create tenant (admin only)
  fastify.post('/api/tenants', { preHandler: requireAuth('ADMIN') }, async (request, reply) => {
    const user = request.user;
    const body = createTenantSchema.parse(request.body);
      
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: body.slug },
      });
      
      if (existingTenant) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Tenant with this slug already exists' 
        });
      }
      
      const tenant = await prisma.tenant.create({
        data: {
          name: body.name,
          slug: body.slug,
          plan: body.plan,
          settings: body.settings,
          users: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      
      return reply.status(201).send({ success: true, data: tenant });

  });
}