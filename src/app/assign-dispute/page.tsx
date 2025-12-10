"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/useAssignDispute";
import { Search } from "lucide-react";
import { CategoryAmountHeader } from "@/components/category-amount/CategoryAmountHeader";

export default function AssignDisputePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0.00005";

  const { findActiveDispute, isFinding } = useAssignDispute();
  const hasSearched = useRef(false); // Prevent double-fire in Strict Mode

  useEffect(() => {
    if (hasSearched.current) return;
    hasSearched.current = true;

    const runMatchmaking = async () => {
      // 1. Run the logic to find an ID
      const disputeId = await findActiveDispute();

      if (disputeId) {
        // 2. Found one? Forward to the confirmation page
        router.replace(`/join-dispute/${disputeId}?amount=${amount}`);
      }
    };

    runMatchmaking();
  }, [findActiveDispute, router, amount]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <CategoryAmountHeader onBack={() => router.back()} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        {isFinding ? (
          <>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1b1c23]">
              Finding a Case...
            </h2>
            <p className="text-gray-500 px-8">
              We are searching the blockchain for an active dispute that matches
              your criteria.
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500 font-medium">
              Could not find a suitable dispute.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#1b1c23] text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
