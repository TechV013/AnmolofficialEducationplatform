import { AuthToken, AuthUser } from "./types";
import { AuthOptions, User } from "next-auth";
import { UserRole } from "@/types/lms";

import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { type: "text" }, password: { type: "password" } },
      async authorize(credentials) { return null; }
    })
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role: UserRole }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        const t = token as unknown as AuthToken;
        session.user = { 
            ...session.user, 
            id: t.id, 
            role: t.role,
            email: t.email || session.user.email || "",
            name: session.user.name || ""
        } as AuthUser;
      }
      return session;
    },
  },
};
