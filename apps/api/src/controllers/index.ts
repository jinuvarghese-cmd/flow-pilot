import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { registerUserRoutes } from './users';
import { registerTenantRoutes } from './tenants';
import { registerWorkflowRoutes } from './workflows';
import { registerClientRoutes } from './clients';

export async function registerRoutes(fastify: FastifyInstance, prisma: PrismaClient){
    await registerTenantRoutes(fastify, prisma);
    await registerUserRoutes(fastify, prisma);
    await registerWorkflowRoutes(fastify, prisma);
    await registerClientRoutes(fastify, prisma);
}