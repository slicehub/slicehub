import { useCallback, useState, useEffect } from "react";
import { useSliceContract } from "./useSliceContract";
import { fetchJSONFromIPFS } from "@/util/ipfs";

export interface DisputeData {
  // --- On-Chain Data (Source of Truth for Logic) ---
  id: bigint;
  claimer: string;
  defender: string;
  status: number;
  category: string; // Comes directly from contract
  jurors_required: number;
  deadline_pay_seconds: bigint;
  deadline_commit_seconds: bigint;
  deadline_reveal_seconds: bigint;
  assigned_jurors: string[];
  winner?: string;
  requiredStake: bigint;

  // --- Off-Chain Data (Source of Truth for Display) ---
  title?: string;
  description?: string;
  evidence?: string[];
}

export function useGetDispute(disputeId: string | number) {
  const contract = useSliceContract();
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDispute = useCallback(async () => {
    if (!contract || !disputeId) return;

    setIsLoading(true);
    try {
      // 1. Get On-Chain Data
      const d = await contract.disputes(disputeId);

      // 2. Get IPFS Hash
      const ipfsHash = d.ipfsHash;

      let metadata: any = {};
      if (ipfsHash) {
        // 3. Fetch Off-Chain Data
        metadata = await fetchJSONFromIPFS(ipfsHash);
      }

      setDispute({
        // --- On-Chain Mapping ---
        id: d.id,
        claimer: d.claimer,
        defender: d.defender,
        status: Number(d.status),
        // CRITICAL: Category is read from chain to ensure subcourt accuracy
        category: d.category,
        jurors_required: Number(d.jurorsRequired),
        deadline_pay_seconds: d.payDeadline,
        deadline_commit_seconds: d.commitDeadline,
        deadline_reveal_seconds: d.revealDeadline,
        requiredStake: d.requiredStake,
        winner: d.winner,
        assigned_jurors: [],

        // --- Off-Chain Mapping ---
        title: metadata.title || `Dispute #${d.id}`,
        description: metadata.description || "No description provided.",
        evidence: metadata.evidence || [],
      });
    } catch (err) {
      console.error("Error fetching dispute:", err);
    } finally {
      setIsLoading(false);
    }
  }, [disputeId, contract]);

  useEffect(() => {
    void fetchDispute();
  }, [fetchDispute]);

  return { dispute, isLoading, refetch: fetchDispute };
}
