import { Navigate, type RouteObject } from "react-router";
import { studentDashboardRoutes } from "./dashboard-routes";

export const studentRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="dashboard" replace />,
  },
  ...studentDashboardRoutes,
];
