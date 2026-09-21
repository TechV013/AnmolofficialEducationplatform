"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

const STORAGE_KEY = "lms_session_user_id";
const REDIRECT_DELAY_MS = 4000;

export default function SessionGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const initRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    const currentUserId = (session?.user as { id?: string })?.id || null;
    const storedUserId = sessionStorage.getItem(STORAGE_KEY);

    if (status === "unauthenticated") {
      sessionStorage.removeItem(STORAGE_KEY);
      if (storedUserId) {
        setBannerMessage("You have been signed out.");
        setShowBanner(true);
        const timer = setTimeout(() => {
          router.replace("/login?reason=session_changed");
        }, REDIRECT_DELAY_MS);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (status === "authenticated" && currentUserId) {
      if (!initRef.current) {
        sessionStorage.setItem(STORAGE_KEY, currentUserId);
        initRef.current = true;
        return;
      }

      if (storedUserId && storedUserId !== currentUserId) {
        setBannerMessage(
          "Your session has changed in another tab. Redirecting to sign in..."
        );
        setShowBanner(true);
        const timer = setTimeout(() => {
          router.replace("/login?reason=session_changed");
        }, REDIRECT_DELAY_MS);
        return () => clearTimeout(timer);
      }

      if (!storedUserId) {
        sessionStorage.setItem(STORAGE_KEY, currentUserId);
      }
    }
  }, [session, status, router]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{bannerMessage}</span>
    </div>
  );
}
