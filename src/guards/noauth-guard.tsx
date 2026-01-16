import { useAuth } from "@/contexts/auth-context";
import { getRoleBasePath } from "@/lib/route-helpers";
import { type PropsWithChildren } from "react";
import { Navigate } from "react-router";

/**
 * Redirects authenticated users to their role-based dashboard
 * Used to prevent logged-in users from accessing auth pages (login, etc.)
 */
export function NoAuthGuard({ children }: PropsWithChildren) {
  const { auth, user } = useAuth();

  // If user is authenticated, redirect to their role-based dashboard
  if (auth && user) {
    const basePath = getRoleBasePath(user.type);
    return <Navigate to={basePath} replace />;
  }

  return <>{children}</>;
}
