import { PrismaClient } from '@prisma/client';

export function createResolvers(prisma: PrismaClient) {
  return {
    Query: {
      tenants: async () => prisma.tenant.findMany(),
      tenant: async (_: any, { id }: { id: string }) =>
        prisma.tenant.findUnique({ where: { id } }),
      users: async () => prisma.user.findMany(),
      user: async (_: any, { id }: { id: string }) =>
        prisma.user.findUnique({ where: { id } }),
      workflows: async () => prisma.workflow.findMany(),
      workflow: async (_: any, { id }: { id: string }) =>
        prisma.workflow.findUnique({ where: { id } }),
      clients: async () => prisma.client.findMany(),
      client: async (_: any, { id }: { id: string }) =>
        prisma.client.findUnique({ where: { id } }),
      documents: async () => prisma.document.findMany(),
      document: async (_: any, { id }: { id: string }) =>
        prisma.document.findUnique({ where: { id } }),
    },
    Mutation: {
      createTenant: async (_: any, { input }: any) => {
        return prisma.tenant.create({ data: input });
      },
      createUser: async (_: any, { input }: any) => {
        return prisma.user.create({ data: input });
      },
      createWorkflow: async (_: any, { input }: any) => {
        return prisma.workflow.create({ data: input });
      },
      createClient: async (_: any, { input }: any) => {
        return prisma.client.create({ data: input });
      },
    },
    Tenant: {
      users: (parent: any) =>
        prisma.user.findMany({ where: { tenantId: parent.id } }),
      workflows: (parent: any) =>
        prisma.workflow.findMany({ where: { tenantId: parent.id } }),
      clients: (parent: any) =>
        prisma.client.findMany({ where: { tenantId: parent.id } }),
      documents: (parent: any) =>
        prisma.document.findMany({ where: { tenantId: parent.id } }),
    },
  };
}