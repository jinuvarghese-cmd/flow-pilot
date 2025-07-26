// apps/web/src/components/TenantSwitcher.tsx
import { useSession, signIn, signOut, update } from "next-auth/react";

export function TenantSwitcher({ tenants }) {
  const { data: session, update: updateSession } = useSession();

  const handleSwitch = async (tenantId) => {
    // Call API to update session/tenant context
    await fetch("/api/switch-tenant", {
      method: "POST",
      body: JSON.stringify({ tenantId }),
      headers: { "Content-Type": "application/json" },
    });
    await updateSession();
  };

  return (
    <select onChange={e => handleSwitch(e.target.value)} value={session.user.tenantId}>
      {tenants.map(t => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}