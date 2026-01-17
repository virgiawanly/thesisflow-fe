import MainLayout from "@/components/layouts/main";
import { AuthGuard } from "@/guards/auth-guard";
import { NoAuthGuard } from "@/guards/noauth-guard";
import { RedirectRoleGuard } from "@/guards/redirect-role-guard";
import { Error404Page } from "@/pages/errors/error-404-page";
import type { RouteObject } from "react-router-dom";
import { AppRouting } from "./app-routing";
import { AuthRouting } from "./auth-routing";
import { lecturerRoutes } from "./routes/lecturer";
import { studentRoutes } from "./routes/student";

export function createAppRoutesConfig(): RouteObject[] {
  return [
    {
      path: "/",
      element: <AppRouting />,
      children: [
        // Root index - redirect based on auth status and user role
        {
          index: true,
          element: <RedirectRoleGuard />,
        },
        // Auth routes (login, etc.) - redirect if already authenticated
        {
          path: "auth/*",
          element: (
            <NoAuthGuard>
              <AuthRouting />
            </NoAuthGuard>
          ),
        },
        // Protected routes - require authentication and role-based access
        {
          path: "/",
          element: (
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          ),
          children: [
            // Student routes
            {
              path: "student",
              children: studentRoutes,
            },
            // Lecturer routes
            {
              path: "lecturer",
              children: lecturerRoutes,
            },
            // System Admin routes
            {
              path: "system-admin",
              element: <div>System Admin Dashboard (TODO: Implement)</div>,
            },
            // Program Study Admin routes
            {
              path: "program-study-admin",
              element: <div>Program Study Admin Dashboard (TODO: Implement)</div>,
            },
          ],
        },
        // Catch-all route for 404 (without layout)
        {
          path: "*",
          element: <Error404Page />,
        },
      ],
    },
  ];
}
