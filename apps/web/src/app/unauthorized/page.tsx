"use client";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-yellow-600">Unauthorized</h2>
        <p className="mb-6">You do not have permission to view this page.</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push("/")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}