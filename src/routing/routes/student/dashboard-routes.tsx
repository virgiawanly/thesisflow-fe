import StudentDashboardIndexPage from "@/pages/student/dashboard/dashboard-index";
import type { RouteObject } from "react-router";

export const studentDashboardRoutes: RouteObject[] = [
  {
    path: "dashboard",
    element: <StudentDashboardIndexPage />,
  },
];
