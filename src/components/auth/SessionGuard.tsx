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
  const userId = session?.user ? (session.user as { id?: string }).id : null;

  useEffect(() => {
    if (status === "loading") return;

    const currentUserId = userId;
    const storedUserId = sessionStorage.getItem(STORAGE_KEY);

    if (status === "unauthenticated") {
      sessionStorage.removeItem(STORAGE_KEY);
      // Only show banner if there was a previous session (to avoid showing on fresh guest visit)
      if (storedUserId) {
        setBannerMessage("Session expired. Please sign in again.");
        setShowBanner(true);
        // Auto-hide banner after 3 seconds
        const hideTimer = setTimeout(() => setShowBanner(false), 3000);
        
        const redirectTimer = setTimeout(() => {
          router.replace("/login?reason=session_changed");
        }, REDIRECT_DELAY_MS);
        
        return () => {
          clearTimeout(hideTimer);
          clearTimeout(redirectTimer);
        };
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
          "Your session has changed. Redirecting..."
        );
        setShowBanner(true);
        // Auto-hide banner after 3 seconds
        const hideTimer = setTimeout(() => setShowBanner(false), 3000);

        const redirectTimer = setTimeout(() => {
          router.replace("/login?reason=session_changed");
        }, REDIRECT_DELAY_MS);
        
        return () => {
          clearTimeout(hideTimer);
          clearTimeout(redirectTimer);
        };
      }

      if (!storedUserId) {
        sessionStorage.setItem(STORAGE_KEY, currentUserId);
      }
    }
  }, [status, userId, router]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-top duration-300">
      <AlertCircle className="h-4 w-4 shrink-0 text-blue-400" />
      <span>{bannerMessage}</span>
    </div>
  );
}
