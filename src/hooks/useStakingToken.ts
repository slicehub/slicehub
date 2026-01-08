import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI, SLICE_ADDRESS } from "@/config/contracts";
import { erc20Abi } from "viem";

export function useStakingToken() {
  // Fetch the address from the Slice contract
  const { data: tokenAddress } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "stakingToken",
  });

  // Fetch Metadata (Decimals, Symbol) from the Token contract
  const { data: tokenMetadata, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
    query: { enabled: !!tokenAddress },
  });

  return {
    address: tokenAddress as `0x${string}`,
    decimals: tokenMetadata?.[0]?.result ?? 6, // Fallback to 6 (USDC decimals)
    symbol: tokenMetadata?.[1]?.result ?? "TOKEN",
    isLoading,
  };
}
