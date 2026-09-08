"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/** Auto-login for UI prototype — backend replaces with Supabase session */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) login();
  }, [isAuthenticated, login]);

  return <>{children}</>;
}
