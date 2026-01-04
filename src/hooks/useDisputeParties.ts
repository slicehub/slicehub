import { useMemo } from "react";
import { shortenAddress } from "@/util/wallet";

export function useDisputeParties(dispute: any) {
  return useMemo(() => {
    // 1. Prefer the "Name" (Alias) if available, otherwise fallback to address
    const claimerRaw = dispute?.claimerName || dispute?.claimer;
    const defenderRaw = dispute?.defenderName || dispute?.defender;

    // 2. Use shortenAddress:
    // - If it's a 0x address, it becomes 0x12...34
    // - If it's a real name (e.g. "John Doe"), it stays "John Doe"
    const claimerLabel = shortenAddress(claimerRaw) || "Claimant";
    const defenderLabel = shortenAddress(defenderRaw) || "Defendant";

    return {
      claimer: {
        name: claimerLabel,
        roleLabel: "Claimant",
        avatarUrl: "/images/profiles-mockup/profile-1.jpg",
        themeColor: "blue",
      },
      defender: {
        name: defenderLabel,
        roleLabel: "Defendant",
        avatarUrl: "/images/profiles-mockup/profile-2.jpg",
        themeColor: "gray",
      },
    };
  }, [dispute]);
}
