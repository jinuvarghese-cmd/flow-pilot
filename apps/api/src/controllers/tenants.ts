import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

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
  // Get all tenants
  fastify.get('/api/tenants', async (request, reply) => {
    try {
      const tenants = await prisma.tenant.findMany({
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
    } catch (error) {
      fastify.log.error('Error fetching tenants:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Get tenant by ID
  fastify.get('/api/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id },
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
    } catch (error) {
      fastify.log.error('Error fetching tenant:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });

  // Create tenant
  fastify.post('/api/tenants', async (request, reply) => {
    try {
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
        },
      });
      
      return reply.status(201).send({ success: true, data: tenant });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      
      fastify.log.error('Error creating tenant:', error);
      return reply.status(500).send({ success: false, error: 'Internal server error' });
    }
  });
}