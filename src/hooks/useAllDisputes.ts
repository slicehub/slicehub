import { useReadContract, useReadContracts } from "wagmi";
import { SLICE_ABI, SLICE_ADDRESS } from "@/config/contracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";

export function useAllDisputes() {
  // 1. Get the total number of disputes
  const { data: countData } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "disputeCount",
  });

  // 2. Calculate the latest 20 IDs (e.g., 50, 49, 48...)
  const calls = useMemo(() => {
    if (!countData) return [];
    const total = Number(countData);
    const start = total;
    const end = Math.max(1, total - 20 + 1); // Fetch last 20
    const contracts = [];

    for (let i = start; i >= end; i--) {
      contracts.push({
        address: SLICE_ADDRESS,
        abi: SLICE_ABI,
        functionName: "disputes",
        args: [BigInt(i)],
      });
    }
    return contracts;
  }, [countData]);

  // 3. Fetch data for those IDs
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

  // 4. Transform Data (IPFS, etc.)
  useEffect(() => {
    async function process() {
      if (!results) {
        if (!isMulticallLoading && countData) setIsProcessing(false);
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
  }, [results, isMulticallLoading, countData]);

  return { disputes, isLoading: isMulticallLoading || isProcessing, refetch };
}
