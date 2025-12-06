"use client";

import { createContext, useContext, ReactNode } from "react";

interface ContextType {
  isEmbedded: boolean;
}

export const EmbeddedContext = createContext<ContextType | null>(null);

export const useEmbedded = () => {
  const context = useContext(EmbeddedContext);
  if (!context) {
    throw new Error("useEmbedded must be used inside <EmbeddedProvider>");
  }
  return context;
};

export const EmbeddedProvider = ({ children }: { children: ReactNode }) => {
  // 1. Determine the current environment
  // We check NEXT_PUBLIC_APP_ENV first (e.g. "staging", "production")
  // Fallback to NODE_ENV (standard Next.js env)
  const currentEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;

  // 2. Logic: If Production -> Embedded. Else -> Not Embedded.
  const isEmbedded = currentEnv === "production";

  return (
    <EmbeddedContext.Provider value={{ isEmbedded }}>
      {children}
    </EmbeddedContext.Provider>
  );
};
