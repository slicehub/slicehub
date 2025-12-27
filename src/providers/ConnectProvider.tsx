"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
} from "react";

import { useEmbedded } from "./EmbeddedProvider";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect as useWagmiConnect, useDisconnect } from "wagmi";
import { useSmartWallet } from "@/hooks/useSmartWallet";

interface ConnectContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  address: string | null;
  isConnecting: boolean;
  isWrongNetwork: boolean;
}

const ConnectContext = createContext<ConnectContextType | null>(null);

export const ConnectProvider = ({ children }: { children: ReactNode }) => {
  const { isEmbedded } = useEmbedded();
  const { login, logout } = usePrivy();
  const { connectAsync: wagmiConnect, connectors } = useWagmiConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Unified State from useSmartWallet (which uses Wagmi)
  const { address, isWrongNetwork } = useSmartWallet();

  const connect = async () => {
    console.log("[ConnectProvider] connect called. isEmbedded:", isEmbedded);

    if (isEmbedded) {
      console.log("[ConnectProvider] Available connectors:", connectors.map(c => c.id));
      const xo = connectors.find((c) => c.id === "xo-connect");

      if (xo) {
        console.log("[ConnectProvider] XO Connector found. Initiating connection...");
        try {
          await wagmiConnect({ connector: xo });
          console.log("[ConnectProvider] Connection successful");
        } catch (err: any) {
          console.error("[ConnectProvider] Connect error:", err);

          if (err.name === 'ConnectorAlreadyConnectedError') {
            console.warn("[ConnectProvider] Connector reported as already connected.");

            // If we are "connected" but have no address, the state is corrupted.
            // Force a disconnect so the user can click "Connect" again cleanly.
            if (!address) {
              console.warn("[ConnectProvider] No address found. Forcing disconnect to reset state.");
              wagmiDisconnect();
            }
          } else {
            throw err;
          }
        }
      } else {
        console.error("[ConnectProvider] ❌ CRITICAL: 'xo-connect' connector NOT found in Wagmi config.");
        alert("Configuration Error: Embedded connector missing.");
      }
    } else {
      login();
    }
  };

  const disconnect = async () => {
    if (isEmbedded) {
      wagmiDisconnect();
    } else {
      await logout();
    }
  };

  return (
    <ConnectContext.Provider
      value={{
        connect,
        disconnect,
        address: address || null,
        isConnecting: false,
        isWrongNetwork,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};

export const useConnect = () => {
  const ctx = useContext(ConnectContext);
  if (!ctx)
    throw new Error("useContracts must be used within ContractsProvider");
  return ctx;
};
