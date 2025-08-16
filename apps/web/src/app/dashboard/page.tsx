"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import { 
  Workflow, 
  Users, 
  FileText, 
  Settings,
  Play,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-green-700 mb-4">
                            Welcome to FlowPilot
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Your all-in-one AI-powered business workflow automation platform.
                            Build, manage, and execute workflows with ease.
                        </p>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <Link 
                            href="/workflow-builder"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <Workflow className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        Workflow Builder
                                    </h3>
                                    <p className="text-gray-600">Create and design automation workflows</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/workflows"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <Play className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                        My Workflows
                                    </h3>
                                    <p className="text-gray-600">View and manage your workflows</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/clients"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Users className="w-8 h-8 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                        Client Management
                                    </h3>
                                    <p className="text-gray-600">Manage your client relationships</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/documents"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <FileText className="w-8 h-8 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                        Documents
                                    </h3>
                                    <p className="text-gray-600">Organize and manage documents</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/analytics"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        Analytics
                                    </h3>
                                    <p className="text-gray-600">Track workflow performance</p>
                                </div>
                            </div>
                        </Link>

                        <Link 
                            href="/settings"
                            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                    <Settings className="w-8 h-8 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">
                                        Settings
                                    </h3>
                                    <p className="text-gray-600">Configure your workspace</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="text-center py-8 text-gray-500">
                            <p>No recent activity to display</p>
                            <p className="text-sm mt-2">Start building workflows to see activity here</p>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}