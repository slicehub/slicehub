"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CategoryAmountHeader } from "@/components/category-amount/CategoryAmountHeader";
import { AmountSelector } from "@/components/category-amount/AmountSelector";
import { InfoCard } from "@/components/category-amount/InfoCard";
import { SwipeButton } from "@/components/category-amount/SwipeButton";
import { useAssignDispute } from "@/hooks/useAssignDispute";

export default function CategoryAmountPage() {
  const router = useRouter();
  // Initialize with a default stake amount (e.g., 20 USD/Tokens)
  const [selectedAmount, setSelectedAmount] = React.useState<number>(20);

  // Hook to interact with the Slice contract's assign_dispute function
  const { assignDispute, isLoading } = useAssignDispute();

  const handleBack = () => {
    router.push("/disputes");
  };

  const handleSwipeComplete = async () => {
    // 1. Define the category
    const category = "General";

    // 2. Trigger the smart contract interaction
    const result = await assignDispute(category, BigInt(selectedAmount));

    // 3. Navigate using the returned Dispute ID
    if (result) {
      // The contract returns a tuple: [dispute_id (u64), juror_address (Address)]
      // We access the first element (index 0) and convert BigInt to string
      const disputeId = (result as any)[0].toString();

      router.push(`/loading-disputes/${disputeId}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <CategoryAmountHeader onBack={handleBack} />

      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center mb-4">
        <div className="w-24 h-24 mb-4">
          <video
            src="/animations/money.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold mb-2">Select amount of money</h1>

        <p className="text-gray-500 text-sm mb-6">
          You&apos;ll play with users with a monetary range selection like yours
        </p>

        <AmountSelector
          selectedAmount={selectedAmount}
          onAmountChange={setSelectedAmount}
        />
      </div>

      <InfoCard />

      <div className="mt-auto flex justify-center pb-8">
        {/* Conditional rendering: Show loading state while transaction is processing */}
        {isLoading ? (
          <div
            style={{
              padding: "12px",
              background: "#1b1c23",
              borderRadius: "14px",
              color: "white",
              textAlign: "center",
              width: "241px",
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
              Confirming Stake on Chain...
            </span>
          </div>
        ) : (
          <SwipeButton onSwipeComplete={() => void handleSwipeComplete()}>
            Swipe to find disputes
          </SwipeButton>
        )}
      </div>
    </div>
  );
}
