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
  const isEmbedded = process.env.NEXT_PUBLIC_IS_EMBEDDED === "true";

  return (
    <EmbeddedContext.Provider value={{ isEmbedded }}>
      {children}
    </EmbeddedContext.Provider>
  );
};
