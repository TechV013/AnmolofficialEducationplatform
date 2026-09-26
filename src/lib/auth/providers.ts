import GoogleProvider from "next-auth/providers/google";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleProvider(): ReturnType<typeof GoogleProvider> | null {
  if (!isGoogleOAuthConfigured()) return null;
  return GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  });
}