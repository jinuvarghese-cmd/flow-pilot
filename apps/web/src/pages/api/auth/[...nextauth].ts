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
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
              token.id = user.id;
              token.role = user.role;
              token.tenantId = user.tenantId;
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