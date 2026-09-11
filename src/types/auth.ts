export type UserRole = "STUDENT" | "ADMIN" | "INSTRUCTOR";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthToken {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: Date;
}
