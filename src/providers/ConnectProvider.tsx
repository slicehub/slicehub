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
  const { connect: wagmiConnect, connectors } = useWagmiConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Unified State from useSmartWallet (which uses Wagmi)
  const { address, isWrongNetwork } = useSmartWallet();

  const connect = async () => {
    if (isEmbedded) {
      const xo = connectors.find((c) => c.id === "xo-connect");
      if (xo) {
        wagmiConnect({ connector: xo });
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
