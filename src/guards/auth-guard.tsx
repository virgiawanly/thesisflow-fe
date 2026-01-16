import { useAuth } from "@/contexts/auth-context";
import { canAccessRoute, getRoleBasePath } from "@/lib/route-helpers";
import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";
import { ScreenLoader } from "../components/common/screen-loader";

/**
 * Route guard that requires authentication and role-based access
 * Redirects to login if not authenticated
 * Redirects to user's base path if they don't have access to the current route
 */
export function AuthGuard({ children }: PropsWithChildren) {
  const { auth, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while verifying authentication
  if (loading) {
    return <ScreenLoader />;
  }

  // Redirect to login if not authenticated
  if (!auth || !user) {
    return (
      <Navigate
        to={`/auth/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Check if user can access this route based on their role
  if (!canAccessRoute(user.type, location.pathname)) {
    const basePath = getRoleBasePath(user.type);
    return <Navigate to={basePath} replace />;
  }

  return <>{children}</>;
}
