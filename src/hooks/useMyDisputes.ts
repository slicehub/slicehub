import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { SLICE_ABI, SLICE_ADDRESS } from "@/config/contracts";
import { transformDisputeData, type DisputeUI } from "@/util/disputeAdapter";
import { useMemo, useState, useEffect } from "react";
import { useStakingToken } from "./useStakingToken";

export function useMyDisputes() {
  const { address } = useAccount();
  const { decimals } = useStakingToken();

  // 1. Fetch IDs
  // We rely on the smart contract fix (userDisputes[_config.claimer])
  // so these standard calls will now work correctly.
  const { data: jurorIds, isLoading: loadJuror } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "getJurorDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userIds, isLoading: loadUser } = useReadContract({
    address: SLICE_ADDRESS,
    abi: SLICE_ABI,
    functionName: "getUserDisputes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // 2. Merge & Deduplicate IDs
  const sortedIds = useMemo(() => {
    const jIds = (jurorIds as bigint[]) || [];
    const uIds = (userIds as bigint[]) || [];

    const unique = Array.from(
      new Set([...jIds, ...uIds].map((id) => id.toString())),
    );

    return unique.map(BigInt).sort((a, b) => Number(b) - Number(a));
  }, [jurorIds, userIds]);

  // 3. Prepare Multicall
  const calls = useMemo(() => {
    return sortedIds.map((id) => ({
      address: SLICE_ADDRESS,
      abi: SLICE_ABI,
      functionName: "disputes",
      args: [id],
    }));
  }, [sortedIds]);

  const { data: results, isLoading: loadMulti } = useReadContracts({
    contracts: calls,
    query: { enabled: sortedIds.length > 0 },
  });

  const [disputes, setDisputes] = useState<DisputeUI[]>([]);

  // 4. Transform Data
  useEffect(() => {
    // If results is undefined/null, handle empty state or return
    if (!results) {
      if (!loadMulti && sortedIds.length === 0) setDisputes([]);
      return;
    }

    // FIX: Capture 'results' into a local const to satisfy TypeScript's
    // narrowing inside the async closure below.
    const currentResults = results;

    async function process() {
      const processed = await Promise.all(
        currentResults.map(async (res, idx) => {
          if (res.status !== "success") return null;

          // Inject ID manually to be safe
          const id = sortedIds[idx].toString();

          return await transformDisputeData(
            { ...(res.result as any), id },
            decimals,
          );
        }),
      );
      setDisputes(processed.filter((d): d is DisputeUI => d !== null));
    }
    process();
  }, [results, decimals, sortedIds, loadMulti]);

  return {
    disputes,
    isLoading: loadJuror || loadUser || loadMulti,
  };
}
