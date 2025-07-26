"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same provider you used originally.",
    EmailSignin: "Check your email for a sign-in link.",
    AccessDenied: "Access denied. You do not have permission to sign in.",
}

export default function AuthError() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState("An unknown error occurred");

    useEffect(() => {
        const error = searchParams?.get("error");
        if(error && errorMessages[error]){
            setMessage(errorMessages[error]);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
            <p className="mb-6">{message}</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => router.push("/auth/signin")}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      );
}