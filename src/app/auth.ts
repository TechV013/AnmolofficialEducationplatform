import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/config";
import { getGoogleProvider } from "@/lib/auth/providers";

const googleProvider = getGoogleProvider();

const handler = NextAuth({
  ...authConfig,
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Pasted addresses often carry surrounding whitespace. Without this the
        // lookup misses and a valid account is reported as invalid.
        const email = String(credentials.email).trim().toLowerCase();

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (e) {
          // An unreachable database is an outage, not a bad password. Throwing a
          // credentials error here makes a server-side incident look like the
          // user typed the wrong password.
          console.error("Auth DB Error:", e);
          throw new Error("DatabaseUnavailable");
        }

        if (!user || !user.passwordHash) {
          // Same message and comparison either way so the response cannot be used
          // to enumerate which emails have accounts.
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("AccountDeactivated");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

export { handler as GET, handler as POST };
