import { getSession } from "next-auth/react";

export async function apiClient(endpoint: string, options: RequestInit = {}){
    const session = await getSession();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    }

    if(session?.accessToken){
        headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
    });
}