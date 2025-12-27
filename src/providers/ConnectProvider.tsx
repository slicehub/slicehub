"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
} from "react";

import { useEmbedded } from "./EmbeddedProvider";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect as useWagmiConnect, useDisconnect, useAccount } from "wagmi";
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
  const { login, logout, ready, authenticated } = usePrivy();
  const { connectAsync: wagmiConnect, connectors } = useWagmiConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Debugging State
  const { status, address: wagmiAddress, chainId, isConnected, connector } = useAccount();

  React.useEffect(() => {
    console.log("⚡ [Wagmi State Change]", {
      status,       // Should change 'disconnected' -> 'connecting' -> 'connected'
      address: wagmiAddress,      // Should be 0x...
      chainId,      // Should be number
      isConnected,  // Should be true
      connector: connector?.name // Should be 'XO Wallet'
    });
  }, [status, wagmiAddress, chainId, isConnected, connector]);

  // Unified State from useSmartWallet (which uses Wagmi)
  const { address, isWrongNetwork } = useSmartWallet();

  const connect = async () => {
    if (isEmbedded) {
      const xo = connectors.find((c) => c.id === "xo-connect");

      if (xo) {
        try {
          await wagmiConnect({ connector: xo });
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
      if (ready && !authenticated) {
        login();
      } else if (authenticated) {
        console.log("User is already logged in via Privy");
      }
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
