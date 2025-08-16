import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, roles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) signIn();
    else if (roles.length && !roles.includes(session.user.role)) router.replace("/unauthorized");
  }, [session, status, roles, router]);

  if (!session || (roles.length && !roles.includes(session.user.role))) return null;
  return <>{children}</>;
}