import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import SessionGuard from "@/components/auth/SessionGuard";
import { ToastProvider } from "@/components/ui/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.anmolofficial.com"),
  title: {
    default: "@anmlofficials - Learn Creative Skills",
    template: "%s | @anmlofficials",
  },
  description: "Master 3D Modeling, Animation, VFX, Video Editing and more with @anmlofficials.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "@anmlofficials",
    type: "website",
    locale: "en_US",
    url: "https://www.anmolofficial.com",
    title: "@anmlofficials - Learn Creative Skills",
    description: "Master 3D Modeling, Animation, VFX, Video Editing and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ToastProvider>
            <SessionGuard />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
