import { useGetDispute } from "@/hooks/useGetDispute";
import { shortenAddress } from "@/util/wallet";

export type EvidenceRole = "claimant" | "defendant";

export function useEvidence(disputeId: string, role: EvidenceRole) {
  const { dispute } = useGetDispute(disputeId);
  const isClaimant = role === "claimant";

  // 1. Dynamic Party Info
  // Select the correct name based on the role
  const realName = isClaimant
    ? dispute?.claimerName || dispute?.claimer
    : dispute?.defenderName || dispute?.defender;

  const partyInfo = {
    name: realName || "Loading...",
    // Use the specific profile images requested
    // Fallback to shortenAddress if the name looks like a 0x address
    displayName: realName?.startsWith("0x")
      ? shortenAddress(realName)
      : realName,
    avatar: isClaimant
      ? "/images/profiles-mockup/profile-1.jpg"
      : "/images/profiles-mockup/profile-2.jpg",
    role: isClaimant ? "Claimant" : "Defendant",
  };

  // 2. Statement Logic
  let statement = "No statement provided.";

  if (isClaimant) {
    statement = dispute?.description || "No statement provided.";
  } else {
    // For Defender, try to find the specific description, otherwise fallback
    statement = dispute?.defenderDescription
      ? dispute.defenderDescription
      : "The defendant has not submitted a counter-statement text.";
  }

  // 3. Evidence Routing
  // Switch sources based on role
  const rawCarousel = isClaimant
    ? dispute?.carouselEvidence || []
    : dispute?.defenderCarouselEvidence || []; // Use defender specific array

  const rawAudio = isClaimant
    ? dispute?.audioEvidence
    : dispute?.defenderAudioEvidence; // Use defender specific audio

  // Process Images
  const imageEvidence = rawCarousel.map((url: string, i: number) => ({
    id: `img-${i}`,
    type: "image" as const,
    url,
    description: `Exhibit ${i + 1} (${partyInfo.role})`,
    uploadDate: "Attached to case file",
  }));

  // Process Audio
  const audioEvidence = rawAudio
    ? {
        id: `audio-${role}`,
        title: `${partyInfo.role}'s Statement`,
        duration: "Play Audio",
        url: rawAudio,
      }
    : null;

  // Video placeholder (empty for now unless you add video uploads)
  const videoEvidence: any[] = [];

  // Real Carousel (Added to match previous implementation structure if needed)
  const carouselImages = rawCarousel.map((url: string, i: number) => ({
    id: `slide-${i}`,
    url: url,
    description: `Evidence #${i + 1}`,
  }));

  return {
    dispute,
    partyInfo,
    statement,
    imageEvidence,
    videoEvidence,
    audioEvidence,
    carouselImages,
  };
}
