export const UserType = {
  STUDENT: "student",
  LECTURER: "lecturer",
  SYSTEM_ADMIN: "system_admin",
  PROGRAM_STUDY_ADMIN: "program_study_admin",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export interface User {
  id: number;
  nama: string;
  type: UserType;
  username: string;
  email: string;
  password: string;
  student_id?: string | null;
  lecturer_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
