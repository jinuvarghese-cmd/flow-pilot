import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthenticatedUser{
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
}

export async function getUserFromToken(request: any): Promise<AuthenticatedUser | null>{
    try{
        const authHeader = request.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return null;
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;

        if(!decoded || !decoded.id){
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.id},
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
            }
        });

        if(!user){
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: decoded.tenantId || user.tenantId,
        };
    } catch (error) {
        console.error("Error getting user from token:", error);
        return null;
    }
}

export function requireAuth(role?: string){
    return async function(request, reply){
        const user = await getUserFromToken(request);

        if(!user){
            return reply.status(401).send({success: false, error: "Not authenticated"});
        }

        if(role && user.role !== role){
            return reply.status(403).send({success: false, error: "Insufficient permissions"});
        }
        request.user = user;
    }
}

