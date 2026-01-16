import { UserType } from "@/types/user";

/**
 * Get the base path for a user based on their role
 */
export function getRoleBasePath(userType: UserType): string {
  switch (userType) {
    case UserType.STUDENT:
      return "/student";
    case UserType.LECTURER:
      return "/lecturer";
    case UserType.SYSTEM_ADMIN:
      return "/system-admin";
    case UserType.PROGRAM_STUDY_ADMIN:
      return "/program-study-admin";
    default:
      return "/";
  }
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canAccessRoute(userType: UserType, path: string): boolean {
  const basePath = getRoleBasePath(userType);

  // Allow access to auth routes for all users
  if (path.startsWith("/auth")) {
    return true;
  }

  // Allow access to routes that match the user's role base path
  return path.startsWith(basePath);
}

/**
 * Get the redirect path after login based on user role and next parameter
 */
export function getLoginRedirectPath(
  userType: UserType,
  nextPath?: string | null
): string {
  const basePath = getRoleBasePath(userType);

  // If there's a next path and the user can access it, redirect there
  if (nextPath && canAccessRoute(userType, nextPath)) {
    return nextPath;
  }

  // Otherwise, redirect to the user's role-based dashboard
  return basePath;
}
