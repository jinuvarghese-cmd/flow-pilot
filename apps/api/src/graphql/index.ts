import mercurius from 'mercurius';
import { typeDefs } from './schema';
import { createResolvers } from './resolvers';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

export async function registerGraphQL(fastify: FastifyInstance, prisma: PrismaClient) {
  await fastify.register(mercurius, {
    schema: typeDefs,
    resolvers: createResolvers(prisma),
    graphiql: true,
    path: '/graphql',
    context: (request, reply) => ({
      prisma,
      request,
      reply,
    }),
  });
}