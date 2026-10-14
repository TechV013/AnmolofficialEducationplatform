import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import SessionGuard from "@/components/auth/SessionGuard";
import AuthNotificationManager from "@/components/auth/AuthNotificationManager";
import { ToastProvider } from "@/components/ui/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.designvidya.com"),
  title: {
    default: "Design Vidya - Learn Creative Skills",
    template: "%s | Design Vidya",
  },
  description:
    "Master 3D Modeling, Animation, VFX, Video Editing and more with Design Vidya — affordable, expert-led creative courses.",
  keywords: [
    "3D modeling course",
    "animation classes online",
    "VFX training",
    "video editing course",
    "creative skills learning",
    "online design courses",
  ],
  verification: {
    google: "zqQ7Q7ot_jetE4s9_-gKqyYwfggOJiKec1f",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Design Vidya",
    type: "website",
    locale: "en_US",
    url: "https://www.designvidya.com",
    title: "Design Vidya - Learn Creative Skills",
    description: "Master 3D Modeling, Animation, VFX, Video Editing and more.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Design Vidya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Vidya - Learn Creative Skills",
    description: "Master 3D Modeling, Animation, VFX, Video Editing and more.",
    images: ["/images/og-image.png"],
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
      className={`${plusJakarta.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ToastProvider>
            <SessionGuard />
            <AuthNotificationManager />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
