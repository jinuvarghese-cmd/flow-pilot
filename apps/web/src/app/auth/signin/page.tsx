"use client";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignIn() {
    const [providers, setProviders] = useState<any>([]);

    useEffect(
        () => {
            getProviders().then(setProviders);
        },[]
    )

    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign in to FlowPilot</h2>
        {Object.values(providers).map((provider: any) => (
            <div key={provider.name} className="mb-4">
                <button
                    className="w-full py-2 px-4 border rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    onClick={() => signIn(provider.id)}
                >
                    Sign in with {provider.name}
                </button>
            </div>   
        ))}
        </div>
        </div>
    );
}
