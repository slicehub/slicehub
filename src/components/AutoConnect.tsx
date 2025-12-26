"use client";

import { useEffect, useRef } from "react";
import { useConnect, useAccount } from "wagmi";
import { useEmbedded } from "@/providers/EmbeddedProvider";

export function AutoConnect() {
    const { isEmbedded } = useEmbedded();
    const { connect, connectors } = useConnect();
    const { isConnected } = useAccount();

    // Ref prevents React StrictMode from firing the connection attempt twice
    const attemptedRef = useRef(false);

    useEffect(() => {
        // 1. Exit conditions: Not embedded, already connected, or already tried
        if (!isEmbedded || isConnected || attemptedRef.current) return;

        // 2. Find the XO Connector we added to wagmi.ts
        const xoConnector = connectors.find((c) => c.id === "xo-connect");

        if (xoConnector) {
            console.log("🔌 XO Environment detected: Auto-connecting...");
            attemptedRef.current = true;
            connect({ connector: xoConnector });
        }
    }, [isEmbedded, isConnected, connectors, connect]);

    // It renders nothing (Headless)
    return null;
}
