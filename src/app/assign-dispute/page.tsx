"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/useAssignDispute";
import { Search, Loader2 } from "lucide-react";
import { CategoryAmountHeader } from "@/components/category-amount/CategoryAmountHeader";

export default function AssignDisputePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0.00005";

  // Destructure isReady from our hook
  const { findActiveDispute, isReady } = useAssignDispute();
  const [searchFailed, setSearchFailed] = useState(false);
  const hasSearched = useRef(false);

  useEffect(() => {
    // Do not attempt search until contract/wallet is fully initialized
    if (!isReady) return;

    // 2. Prevent double-firing
    if (hasSearched.current) return;
    hasSearched.current = true;

    const runMatchmaking = async () => {
      setSearchFailed(false);
      const disputeId = await findActiveDispute();

      if (disputeId) {
        router.replace(`/join-dispute/${disputeId}?amount=${amount}`);
      } else {
        setSearchFailed(true);
      }
    };

    runMatchmaking();
  }, [findActiveDispute, router, amount, isReady]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <CategoryAmountHeader onBack={() => router.back()} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        {searchFailed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Search className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-[#1b1c23]">
              No Matches Found
            </h2>
            <p className="text-gray-500 max-w-[260px]">
              We couldn't find an active dispute that needs jurors right now.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#1b1c23] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* STATE: LOADING/SEARCHING */
          <>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              {isReady ? (
                <div className="animate-pulse">
                  <Search className="w-10 h-10 text-blue-500" />
                </div>
              ) : (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              )}
            </div>
            <h2 className="text-xl font-bold text-[#1b1c23]">
              {isReady ? "Finding a Case..." : "Connecting to Network..."}
            </h2>
            <p className="text-gray-500 px-8">
              {isReady
                ? "We are searching the blockchain for an active dispute that matches your criteria."
                : "Establishing secure connection to the protocol..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
