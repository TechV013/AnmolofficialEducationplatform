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

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
        } catch (e) {
          console.error("Auth DB Error:", e);
          throw new Error("Database error");
        }

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.");
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
