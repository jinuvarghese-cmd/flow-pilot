import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { parseCookies } from "nookies";

const prisma = new PrismaClient(
    {
        log: ['query', 'info', 'warn', 'error'],
      }
);

prisma.$connect()
  .then(() => {
    console.log('✅ Prisma connected successfully');
  })
export default NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        EmailProvider({
            server: process.env.EMAIL_SERVER!,
            from: process.env.EMAIL_FROM!,
        }),
    ],
    session:{
        strategy: "jwt",
    },
    callbacks:{
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.tenantId = token.tenantId;
            session.accessToken = token.accessToken;
            return session;
        },
        async signIn({user, account, profile}){
            return true;
        },
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;

                // Create tenant for new users here
                if (!user.tenantId) {
                    try {
                        const defaultTenant = await prisma.tenant.create({
                            data: {
                                name: `${user.name}'s Workspace`,
                                slug: `${user.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                                plan: 'FREE',
                                settings: {},
                            },
                        });

                        await prisma.user.update({
                            where: { id: user.id },
                            data: { tenantId: defaultTenant.id },
                        });

                        token.tenantId = defaultTenant.id;
                    } catch (error) {
                        console.error('Error creating default tenant:', error);
                    }
                }
            }

            if(account?.access_token){
                token.accessToken = account.access_token;
            }

            if(trigger === "update" || !token.tenantId){
                const cookies = parseCookies();
                if(cookies.activeTenantId){
                    token.tenantId = cookies.activeTenantId;
                }
            }
            return token;
        },
    },
    pages:{
        signIn: "/auth/signin",
        error: "/auth/error",
    }
});