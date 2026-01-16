import { Navigate, type RouteObject } from "react-router";
import { lecturerDashboardRoutes } from "./dashboard-routes";
import { lecturerTopicOfferRoutes } from "./topic-offer-routes";

export const lecturerRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="dashboard" replace />,
  },
  ...lecturerDashboardRoutes,
  ...lecturerTopicOfferRoutes,
];
