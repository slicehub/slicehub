import { useCallback, useState, useEffect } from "react";
import { useSliceContract } from "./useSliceContract";
import { fetchJSONFromIPFS } from "@/util/ipfs";

export interface DisputeData {
  id: bigint;
  claimer: string;
  defender: string;
  status: number;
  category: string;
  jurors_required: number;
  deadline_pay_seconds: bigint;
  deadline_commit_seconds: bigint;
  deadline_reveal_seconds: bigint;
  assigned_jurors: string[];
  winner?: string;
  requiredStake: bigint;
  title?: string;
  description?: string;
  evidence?: string[];
  deadline: string;
}

export function useGetDispute(disputeId: string | number) {
  const contract = useSliceContract();
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispute = useCallback(async () => {
    if (!contract || !disputeId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching Dispute #${disputeId}...`);

      // 1. Fetch Struct from Smart Contract
      const d = await contract.disputes(disputeId);

      // DEBUG: Log exactly what the contract returned
      console.log("📜 Contract Data:", {
        id: d.id.toString(),
        ipfsHash: d.ipfsHash, // Check if this is empty!
        category: d.category,
      });

      let metadata: any = {
        title: `Dispute #${d.id}`,
        description: "No description available.",
      };

      // 2. Fetch Metadata from IPFS
      if (d.ipfsHash && d.ipfsHash.length > 0) {
        console.log(`🌐 Fetching IPFS Hash: ${d.ipfsHash}`);

        const ipfsData = await fetchJSONFromIPFS(d.ipfsHash);

        if (ipfsData) {
          console.log("✅ IPFS Data Received:", ipfsData);
          metadata = ipfsData;
        } else {
          console.warn("⚠️ IPFS Fetch failed or returned null");
        }
      } else {
        console.warn("⚠️ No IPFS Hash found on contract for this dispute.");
      }

      // 3. Calculate UI Deadline
      const deadlineDate = new Date(Number(d.commitDeadline) * 1000);
      const formattedDeadline = deadlineDate.toLocaleDateString("en-GB");

      setDispute({
        id: d.id,
        claimer: d.claimer,
        defender: d.defender,
        status: Number(d.status),
        category: d.category,
        jurors_required: Number(d.jurorsRequired),
        deadline_pay_seconds: d.payDeadline,
        deadline_commit_seconds: d.commitDeadline,
        deadline_reveal_seconds: d.revealDeadline,
        requiredStake: d.requiredStake,
        winner:
          d.winner === "0x0000000000000000000000000000000000000000"
            ? undefined
            : d.winner,
        assigned_jurors: [],
        title: metadata.title,
        description: metadata.description,
        evidence: metadata.evidence || [],
        deadline: formattedDeadline,
      });
    } catch (err: any) {
      console.error(`❌ Error fetching dispute ${disputeId}:`, err);
      setError("Dispute not found or contract error");
      setDispute(null);
    } finally {
      setIsLoading(false);
    }
  }, [disputeId, contract]);

  useEffect(() => {
    void fetchDispute();
  }, [fetchDispute]);

  return { dispute, isLoading, error, refetch: fetchDispute };
}
