
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export interface AuthenticatedRequest extends NextApiRequest {
    user?:{
        id: string;
        role: string;
        tenantId: string;
        email: string;
    }
}

export async function authenticateRequest(req: AuthenticatedRequest, res: NextApiResponse, next: () => void){
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

    if(!token){
        return res.status(401).json({error: "Not authenticated"});
    }

    req.user = {
        id:token.id as string,
        email: token.email as string,
        role: token.role as string,
        tenantId: token.tenantId as string,
    }

    next();
}


export function requireRole(roles: string[]){
    return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({error: "Insufficient permissions"});
        }
        next();
    }
}
