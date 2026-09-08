"use client";

import { SessionProvider } from "next-auth/react";
import { WaziLabMuiProvider } from "@/components/providers/WaziLabMuiProvider";
import { ModalRoot } from "@/components/simulation/ModalRoot";
import { ToastHost } from "@/components/providers/ToastHost";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CookieConsent } from "@/components/providers/CookieConsent";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={5 * 60}>
      <WaziLabMuiProvider>
        {children}
        <ModalRoot />
        <ToastHost />
        <ChatWidget />
        <CookieConsent />
      </WaziLabMuiProvider>
    </SessionProvider>
  );
}
