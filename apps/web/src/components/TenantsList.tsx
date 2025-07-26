"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export function TenantsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await apiClient("/api/tenants");
      if (!res.ok) throw new Error("Failed to fetch tenants");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading tenants...</div>;
  if (error) return <div>Error loading tenants.</div>;
  if (!data || !data.data) return <div>No data available.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-2">Tenants</h2>
      <ul className="space-y-2">
        {data.data.length === 0 && <li>No tenants found.</li>}
        {data.data.map((tenant: any) => (
          <li key={tenant.id} className="p-2 bg-white rounded shadow">
            <span className="font-bold">{tenant.name}</span> ({tenant.slug})
          </li>
        ))}
      </ul>
    </div>
  );
}