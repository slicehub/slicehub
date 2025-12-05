"use client";

import { createContext, useContext } from "react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";


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

interface Props {
    children: ReactNode;
}

// rutas donde NO es embedded
const NOT_EMBEDDED_ROUTES = new Set<string>(["/not-embedded"]);

export const EmbeddedProvider = ({ children }: Props) => {
    const pathname = usePathname();

    const isEmbedded = !NOT_EMBEDDED_ROUTES.has(pathname);

    return (
        <EmbeddedContext.Provider value={{ isEmbedded }}>
            {children}
        </EmbeddedContext.Provider>
    );
};
