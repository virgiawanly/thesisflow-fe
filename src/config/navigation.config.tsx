import { BookOpenText, FileText, Monitor, Users } from "lucide-react";
import type { UserType } from "@/types/user";
import type { LucideIcon } from "lucide-react";

export interface NavSubItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  subItems?: NavSubItem[];
}

// Student navigation
export const studentNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: Monitor,
  },
  {
    label: "Pengajuan",
    href: "/student/thesis-submissions",
    icon: FileText,
  },
  {
    label: "Topik Dosen",
    href: "/student/lecturer-topics",
    icon: BookOpenText,
  },
];

// Lecturer navigation
export const lecturerNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/lecturer/dashboard",
    icon: Monitor,
  },
  {
    label: "Pengajuan Skripsi",
    href: "/lecturer/thesis-submissions",
    icon: FileText,
  },
  {
    label: "Topik",
    href: "/lecturer/topic-offers",
    icon: BookOpenText,
  },
];

// System Admin navigation
export const systemAdminNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/system-admin/dashboard",
    icon: Monitor,
  },
  {
    label: "Dosen",
    icon: Users,
    subItems: [
      {
        label: "List Dosen",
        href: "/system-admin/lecturers",
      },
      {
        label: "List Topik Dosen",
        href: "/system-admin/lecturer-topics",
      },
    ],
  },
];

// Program Study Admin navigation
export const programStudyAdminNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/program-study-admin/dashboard",
    icon: Monitor,
  },
  {
    label: "Pengajuan",
    href: "/program-study-admin/thesis-submissions",
    icon: FileText,
  },
  {
    label: "Topik Dosen",
    href: "/program-study-admin/lecturer-topics",
    icon: BookOpenText,
  },
  {
    label: "Dosen",
    icon: Users,
    subItems: [
      {
        label: "List Dosen",
        href: "/program-study-admin/lecturers",
      },
      {
        label: "List Topik Dosen",
        href: "/program-study-admin/lecturer-topics",
      },
    ],
  },
];

// Navigation config map by user type
export const navigationConfigMap: Record<UserType, NavItem[]> = {
  student: studentNavigation,
  lecturer: lecturerNavigation,
  system_admin: systemAdminNavigation,
  program_study_admin: programStudyAdminNavigation,
};
