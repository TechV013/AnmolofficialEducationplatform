import { UserRole } from "@/types/lms";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthToken {
  id: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  expires: Date;
}
