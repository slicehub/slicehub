import { formatUnits } from "viem";
import { fetchJSONFromIPFS } from "@/util/ipfs";

export interface DisputeUI {
  id: string;
  title: string;
  category: string;
  status: number;
  phase: "VOTE" | "REVEAL" | "WITHDRAW" | "CLOSED";
  deadlineLabel: string;
  isUrgent: boolean;
  stake: string;
  jurorsRequired: number;
  revealDeadline: number;
  description: string;
  evidence: string[];
  claimer: string;
  defender: string;
  winner?: string;

  // NEW: Real Data Fields
  claimerName?: string;
  defenderName?: string;
  audioEvidence?: string | null;
  carouselEvidence?: string[];

  // NEW: Defender Specific Fields
  defenderDescription?: string;
  defenderAudioEvidence?: string | null;
  defenderCarouselEvidence?: string[];
}

export async function transformDisputeData(
  contractData: any,
): Promise<DisputeUI> {
  const id = contractData.id.toString();
  const status = Number(contractData.status);
  const now = Math.floor(Date.now() / 1000);

  // Defaults
  let title = `Dispute #${id}`;
  let description = "No description provided.";
  let defenderDescription = undefined;
  let category = contractData.category || "General";
  let evidence: string[] = [];

  // Containers for metadata
  let audioEvidence: string | null = null;
  let carouselEvidence: string[] = [];

  // New Containers
  let defenderAudioEvidence: string | null = null;
  let defenderCarouselEvidence: string[] = [];

  let aliases = { claimer: null, defender: null };

  // Fetch IPFS Metadata
  if (contractData.ipfsHash) {
    const meta = await fetchJSONFromIPFS(contractData.ipfsHash);
    if (meta) {
      title = meta.title || title;
      description = meta.description || description;
      if (meta.category) category = meta.category;
      evidence = meta.evidence || [];

      // Capture extra fields
      audioEvidence = meta.audioEvidence || null;
      carouselEvidence = meta.carouselEvidence || [];

      // Map Defender Data
      defenderDescription = meta.defenderDescription;
      defenderAudioEvidence = meta.defenderAudioEvidence || null;
      defenderCarouselEvidence = meta.defenderCarouselEvidence || [];

      if (meta.aliases) aliases = meta.aliases;
    }
  }

  // Phase Logic
  let phase: DisputeUI["phase"] = "CLOSED";
  let deadline = 0;

  if (status === 1) {
    phase = "VOTE";
    deadline = Number(contractData.commitDeadline);
  } else if (status === 2) {
    phase = "REVEAL";
    deadline = Number(contractData.revealDeadline);
    if (now > deadline) phase = "WITHDRAW";
  } else if (status === 3) {
    phase = "CLOSED";
  }

  // Time Logic
  const diff = deadline - now;
  const isUrgent = diff < 86400 && diff > 0;
  const hours = Math.ceil(diff / 3600);
  const deadlineLabel =
    status < 3 ? (diff > 0 ? `${hours}h left` : "Ended") : "Resolved";

  return {
    id,
    title,
    category,
    status,
    phase,
    deadlineLabel,
    isUrgent,
    stake: contractData.requiredStake
      ? formatUnits(contractData.requiredStake, 6)
      : "0",
    jurorsRequired: Number(contractData.jurorsRequired),
    revealDeadline: Number(contractData.revealDeadline),
    description,
    evidence,
    claimer: contractData.claimer,
    defender: contractData.defender,
    winner: contractData.winner,

    // Map new fields using the aliases found in IPFS
    claimerName: aliases.claimer || contractData.claimer,
    defenderName: aliases.defender || contractData.defender,
    audioEvidence,
    carouselEvidence,
    defenderDescription,
    defenderAudioEvidence,
    defenderCarouselEvidence,
  };
}
