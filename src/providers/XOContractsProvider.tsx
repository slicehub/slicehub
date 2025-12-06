"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import { BrowserProvider, Signer } from "ethers";
import { useEmbedded } from "./EmbeddedProvider";
import { settings } from "@/util/config"; // Your dynamic config
// Wagmi & Reown Imports
import { useWalletClient, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { walletClientToSigner } from "@/util/ethers-adapter";

interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

interface XOContractsContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  address: string | null;
  signer: Signer | null;
}

const XOContractsContext = createContext<XOContractsContextType | null>(null);

export const XOContractsProvider = ({ children }: { children: ReactNode }) => {
  const { isEmbedded } = useEmbedded();

  // --- Global State (Exposed to app) ---
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [activeSigner, setActiveSigner] = useState<Signer | null>(null);

  // --- Embedded State (XO) ---
  // We keep XO state local to this provider to switch cleanly
  const [xoAddress, setXoAddress] = useState<string | null>(null);
  const [xoSigner, setXoSigner] = useState<Signer | null>(null);

  // --- Web/Wagmi State (Reown) ---
  const { data: walletClient } = useWalletClient();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { open } = useAppKit(); // Triggers the Reown Modal

  // Get active chain config (Testnet vs Mainnet)
  const activeChain = settings.polygon.supportedChains[0];

  // 1. XO Connection Logic (Embedded)
  const connectXO = async () => {
    try {
      const { XOConnectProvider } = await import("xo-connect");

      const provider: Provider = new XOConnectProvider({
        rpcs: { [activeChain.chainId]: activeChain.rpcUrls[0] },
        defaultChainId: activeChain.chainId,
      });

      await provider.request({ method: "eth_requestAccounts" });

      const ethersProvider = new BrowserProvider(provider);
      const newSigner = await ethersProvider.getSigner();
      const addr = await newSigner.getAddress();

      setXoSigner(newSigner);
      setXoAddress(addr);
      toast.success(`Connected via XO`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect XO");
    }
  };

  // 2. Wagmi/Reown Logic (Web)
  // This Effect listens for Wagmi connection changes automatically
  useEffect(() => {
    if (!isEmbedded && walletClient) {
      const signer = walletClientToSigner(walletClient);
      setActiveSigner(signer);
      setActiveAddress(walletClient.account.address);
    } else if (!isEmbedded && !walletClient) {
      setActiveSigner(null);
      setActiveAddress(null);
    }
  }, [walletClient, isEmbedded]);

  // 3. Sync Logic for Embedded
  // If we are embedded, we sync the XO state to the active state
  useEffect(() => {
    if (isEmbedded) {
      setActiveSigner(xoSigner);
      setActiveAddress(xoAddress);
    }
  }, [xoSigner, xoAddress, isEmbedded]);

  // --- Public Interface ---

  const connect = async () => {
    if (isEmbedded) {
      await connectXO();
    } else {
      // If web, just open the modal. The useEffect above handles the rest.
      await open();
    }
  };

  const disconnect = async () => {
    if (isEmbedded) {
      setXoAddress(null);
      setXoSigner(null);
    } else {
      wagmiDisconnect();
    }
  };

  return (
    <XOContractsContext.Provider
      value={{
        connect,
        disconnect,
        address: activeAddress,
        signer: activeSigner,
      }}
    >
      {children}
    </XOContractsContext.Provider>
  );
};

export const useXOContracts = () => {
  const ctx = useContext(XOContractsContext);
  if (!ctx)
    throw new Error("useXOContracts must be used within XOContractsProvider");
  return ctx;
};
