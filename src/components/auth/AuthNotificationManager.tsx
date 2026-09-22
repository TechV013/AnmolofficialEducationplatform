"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";

export default function AuthNotificationManager() {
  const { status } = useSession();
  const { toast } = useToast();
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current === "loading" && status === "authenticated") {
      toast("Successfully logged in", "success");
    } else if (prevStatusRef.current === "authenticated" && status === "unauthenticated") {
      toast("Logged out", "info");
    }
    prevStatusRef.current = status;
  }, [status, toast]);

  return null;
}
