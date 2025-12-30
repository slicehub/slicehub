import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { SLICE_ABI, SLICE_ADDRESS } from "@/config/contracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";

export function useMyDisputes() {
  const { address } = useAccount();

  // 1. Fetch disputes where I am a Juror
  const { data: jurorIds } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // 2. Fetch disputes where I am a Party (Claimant/Defender)
  const { data: userIds } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // 3. Merge IDs and Prepare Calls
  const calls = useMemo(() => {
    if (!jurorIds && !userIds) return [];

    const jIds = (jurorIds as bigint[]) || [];
    const uIds = (userIds as bigint[]) || [];

    // Create a Set to remove duplicates (e.g. if you accidentally joined your own dispute)
    const uniqueIds = new Set([...jIds, ...uIds].map((id) => id.toString()));

    // Sort descending (Newest first)
    const sortedIds = Array.from(uniqueIds)
      .map((id) => BigInt(id))
      .sort((a, b) => Number(b) - Number(a));

    return sortedIds.map((id) => ({
      address: SLICE_ADDRESS,
      abi: SLICE_ABI,
      functionName: "disputes",
      args: [id],
    }));
  }, [jurorIds, userIds]);

  // 4. Fetch Data
  const {
    data: results,
    isLoading: isMulticallLoading,
    refetch,
  } = useReadContracts({
    contracts: calls,
    query: { enabled: calls.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // 5. Transform Data
  useEffect(() => {
    async function process() {
      if (!results || results.length === 0) {
        if (!isMulticallLoading) {
          setDisputes([]);
          setIsProcessing(false);
        }
        return;
      }

      setIsProcessing(true);
      const processed = await Promise.all(
        results.map(async (result) => {
          if (result.status !== "success") return null;
          return await transformDisputeData(result.result);
        }),
      );

      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
      setIsProcessing(false);
    }
    process();
  }, [results, isMulticallLoading]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
