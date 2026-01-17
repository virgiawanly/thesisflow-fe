import { useAuth } from "@/contexts/auth-context";
import { getRoleBasePath } from "@/lib/route-helpers";
import { Navigate } from "react-router";
import { ScreenLoader } from "../components/common/screen-loader";

/**
 * Root redirect component that redirects to the user's role-based dashboard
 * or to login if not authenticated
 */
export function RedirectRoleGuard() {
  const { auth, user, loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  if (!auth || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const basePath = getRoleBasePath(user.type);
  return <Navigate to={basePath} replace />;
}
