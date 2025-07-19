import { TenantsList } from "@/components/TenantsList";
import { CreateTenantForm } from "@/components/CreateTenantForm";
import { UserButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
      {/* Header Section */}

      <div className="flex flex-col items-center mb-10">
        <h1 className="text-5xl font-extrabold text-blue-700 tracking-tight mb-2">
          FlowPilot
        </h1>
        <div className="h-1 w-16 bg-blue-400 rounded-full mb-4" />
        <p className="text-lg text-gray-600 text-center max-w-xl">
          Your all-in-one <span className="font-semibold text-blue-600">AI-powered</span> business workflow automation platform.
        </p>
      </div>

      {/* Two Separate Cards in a Row */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-8">
        {/* Left Card: Create Tenant Form */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <CreateTenantForm />
        </div>
        {/* Right Card: Tenants List */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <TenantsList />
        </div>
      </div>
    </main>
  );
}