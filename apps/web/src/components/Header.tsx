// apps/web/src/components/Header.tsx
import { TenantSwitcher } from './TenantSwitcher';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">FlowPilot</h1>
          </div>
          <div className="flex items-center space-x-4">
            {session && <TenantSwitcher />}
            {session && (
              <button onClick={() => signOut()}>Sign Out</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}