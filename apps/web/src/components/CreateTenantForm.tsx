"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, or hyphens"),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
  companyName: z.string().min(1, "Company name is required"),
  primaryColor: z.string().default("#3B82F6"),
});

type FormData = z.infer<typeof schema>;

export function CreateTenantForm() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      plan: "FREE",
      primaryColor: "#3B82F6",
    },
  });

  const primaryColor = watch("primaryColor");

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      setError(null);
      const res = await apiClient("/api/tenants", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          plan: data.plan,
          settings: {
            branding: {
              primaryColor: data.primaryColor,
              companyName: data.companyName,
            },
            features: {
              workflows: true,
              automations: false,
              clientPortal: false,
              aiAssistant: false,
            },
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create tenant");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      reset();
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="p-4 bg-white rounded shadow w-full max-w-md space-y-4"
    >
      <h2 className="text-xl font-semibold">Create Tenant</h2>
      <div>
        <label className="block font-medium">Name</label>
        <input {...register("name")} className="input" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Slug</label>
        <input {...register("slug")} className="input" />
        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Plan</label>
        <select {...register("plan")} className="input">
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Company Name</label>
        <input {...register("companyName")} className="input" />
        {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Primary Color</label>
        <input {...register("primaryColor")} className="input w-16 h-10 p-0 border-0" type="color" value={primaryColor}/>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Tenant"}
      </button>
    </form>
  );
}