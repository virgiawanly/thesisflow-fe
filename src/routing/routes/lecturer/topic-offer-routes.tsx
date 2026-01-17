import LecturerTopicOfferCreatePage from "@/pages/lecturer/topic-offers/topic-offer-create-page";
import LecturerTopicOfferDetailPage from "@/pages/lecturer/topic-offers/topic-offer-detail-page";
import LecturerTopicOfferEditPage from "@/pages/lecturer/topic-offers/topic-offer-edit-page";
import LecturerTopicOfferIndexPage from "@/pages/lecturer/topic-offers/topic-offer-index-page";
import type { RouteObject } from "react-router";

export const lecturerTopicOfferRoutes: RouteObject[] = [
  {
    path: "topic-offers",
    element: <LecturerTopicOfferIndexPage />,
  },
  {
    path: "topic-offers/create",
    element: <LecturerTopicOfferCreatePage />,
  },
  {
    path: "topic-offers/:id",
    element: <LecturerTopicOfferDetailPage />,
  },
  {
    path: "topic-offers/:id/edit",
    element: <LecturerTopicOfferEditPage />,
  },
];
