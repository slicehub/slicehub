"use client";

import { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { Contract, formatUnits } from "ethers";
import { useEmbedded } from "@/providers/EmbeddedProvider";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { erc20Abi } from "@/contracts/erc20-abi";

export function useTokenBalance(tokenAddress: string | undefined) {
  const { isEmbedded } = useEmbedded();
  const { address, signer } = useXOContracts();

  // --- 1. Standard Mode (Wagmi) ---
  const {
    data: wagmiData,
    isLoading: isWagmiLoading,
    error: wagmiError,
    refetch,
  } = useBalance({
    address: address as `0x${string}`,
    token: isEmbedded ? undefined : (tokenAddress as `0x${string}`),
    query: {
      enabled: !isEmbedded && !!address && !!tokenAddress,
      retry: 2,
    },
  });

  // --- 2. Embedded Mode (Ethers.js) ---
  const [embeddedBalance, setEmbeddedBalance] = useState<string | null>(null);
  const [isEmbeddedLoading, setIsEmbeddedLoading] = useState(true);

  useEffect(() => {
    if (!isEmbedded) return;

    // If wallet isn't ready, keep loading state valid but don't error
    if (!address || !signer) return;

    if (!tokenAddress) {
      setIsEmbeddedLoading(false);
      return;
    }

    const fetchEmbeddedBalance = async () => {
      try {
        const contract = new Contract(tokenAddress, erc20Abi, signer);
        // Assuming USDC (6 decimals); you can also fetch .decimals() if needed
        const balance = await contract.balanceOf(address);
        setEmbeddedBalance(formatUnits(balance, 6));
      } catch (error) {
        console.error("Failed to fetch embedded balance", error);
        setEmbeddedBalance(null);
      } finally {
        setIsEmbeddedLoading(false);
      }
    };

    fetchEmbeddedBalance();
  }, [isEmbedded, address, signer, tokenAddress]);

  // --- 3. Unified Return ---
  if (isEmbedded) {
    const isWaitingForWallet = !address || !signer;
    return {
      formatted: embeddedBalance,
      symbol: "USDC",
      isLoading: isEmbeddedLoading || isWaitingForWallet,
      error: null,
      refetch: () => {
        /* No-op for embedded currently, or implement re-trigger */
      },
    };
  }

  return {
    formatted: wagmiData?.formatted,
    symbol: wagmiData?.symbol,
    isLoading: isWagmiLoading,
    error: wagmiError,
    refetch,
  };
}
