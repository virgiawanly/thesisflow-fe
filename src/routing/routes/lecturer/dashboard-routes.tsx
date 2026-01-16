import LecturerDashboardIndexPage from "@/pages/lecturer/dashboard/dashboard-index";
import type { RouteObject } from "react-router";

export const lecturerDashboardRoutes: RouteObject[] = [
  {
    path: "dashboard",
    element: <LecturerDashboardIndexPage />,
  },
];
