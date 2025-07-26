import {getToken} from "next-auth/jwt";
import {NextApiRequest, NextApiResponse} from "next";
import { setCookie } from "nookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST"){
        return res.status(405).end();
    }

    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

    if(!token){
        return res.status(401).json({error: "Not authenticated"});
    }

    const {tenantId} = JSON.parse(req.body);

    setCookie({res}, "activeTenantId", tenantId, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
    })

    res.json({ok: true});
}