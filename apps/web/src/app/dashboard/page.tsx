"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <div className="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4 text-green-600">Dashboard</h2>
                <p className="mb-6">You are signed in and authorized to view this page.</p>
                </div>
            </div>
        </ProtectedRoute>
    );

}