import { AuthToken, AuthUser } from "./types";
import { AuthOptions, User } from "next-auth";
import { UserRole } from "@/types/lms";

import CredentialsProvider from "next-auth/providers/credentials";
import { getGoogleProvider } from "./providers";
import { findUserByEmail, resolveGoogleUser } from "@/services/auth/googleAuth.service";

const googleProvider = getGoogleProvider();

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { type: "text" }, password: { type: "password" } },
      async authorize() { return null; }
    }),
    ...(googleProvider ? [googleProvider] : []),
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
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" && user?.email) {
        const existing = await findUserByEmail(user.email);
        if (existing && !existing.isActive) {
          return "/login?reason=account_inactive";
        }
      }
      return true;
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      if (account?.provider === "google" && user?.email) {
        const resolved = await resolveGoogleUser({
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: account.providerAccountId,
        });
        if (resolved.ok) {
          token.id = resolved.user.id;
          token.role = resolved.user.role;
          token.email = resolved.user.email;
          token.name = resolved.user.name || "";
        }
        return token;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role: UserRole }).role;
      }
      if (trigger === "update" && session?.user) {
        token.id = session.user.id || token.id;
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
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return url;
      return baseUrl;
    }
  }
};