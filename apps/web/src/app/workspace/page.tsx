import { TenantsList } from "@/components/TenantsList";
import { CreateTenantForm } from "@/components/CreateTenantForm";

export default function WorkspacePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-6 py-8">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-5xl font-extrabold text-green-700 tracking-tight mb-2">
          Your Workspace
        </h1>
        <div className="h-1 w-16 bg-green-400 rounded-full mb-4" />
        <p className="text-lg text-gray-600 text-center max-w-xl">
          Manage your tenants and workspaces
        </p>
      </div>

      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-8">
        <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
          <CreateTenantForm />
        </div>
        <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
          <TenantsList />
        </div>
      </div>
    </main>
  );
}