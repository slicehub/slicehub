"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSliceVoting } from "@/hooks/useSliceVoting";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { TimerCard } from "@/components/dispute-overview/TimerCard";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { SuccessAnimation } from "@/components/SuccessAnimation";

export default function RevealPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { address } = useXOContracts();
  const { revealVote, isProcessing, logs } = useSliceVoting();

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // State
  const [localVote, setLocalVote] = useState<number | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Check for local vote data on mount
  useEffect(() => {
    if (address) {
      const key = `slice_vote_${disputeId}_${address}`;
      const dataString = localStorage.getItem(key);
      if (dataString) {
        try {
          const data = JSON.parse(dataString);
          setLocalVote(data.vote); // 0 or 1
          setHasLocalData(true);
        } catch (e) {
          console.error("Failed to parse local vote data", e);
        }
      }
    }
  }, [address, disputeId]);

  const handleBack = () => {
    // Navigates back to the evidence flow or main list
    router.push(`/defendant-evidence/${disputeId}`);
  };

  const handleReveal = async () => {
    const success = await revealVote(disputeId);
    if (success) {
      setShowSuccessAnimation(true);
    } else {
      setMessage({
        type: "error",
        text: "Failed to reveal. Check logs or local data integrity.",
      });
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    router.push(`/disputes/${disputeId}`);
  };

  // --- Swipe Logic (Copied from Vote Page) ---
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isDragging.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !startX.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX.current);
    const deltaY = Math.abs(touch.clientY - (startY.current || 0));
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;
      const touch = e.changedTouches[0];
      const deltaX = startX.current - touch.clientX;
      const deltaY = startY.current - touch.clientY;

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX < 0) {
          // Swipe Right -> Go Back
          router.push(`/defendant-evidence/${disputeId}`);
        }
      }
      startX.current = null;
      startY.current = null;
      isDragging.current = false;
    },
    [router, disputeId],
  );

  // Mouse events for desktop
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback(() => {
    if (!isDragging.current || startX.current === null) return;
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;
      const deltaX = startX.current - e.clientX;
      const deltaY = startY.current - e.clientY;

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX < 0) {
          router.push(`/defendant-evidence/${disputeId}`);
        }
      }
      startX.current = null;
      startY.current = null;
      isDragging.current = false;
    },
    [router, disputeId],
  );

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      isDragging.current = false;
      startX.current = null;
      startY.current = null;
    };
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => {
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-gray-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <DisputeOverviewHeader onBack={handleBack} />
      <TimerCard />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Reveal Vote</h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
              PHASE: REVEAL
            </span>
          </div>

          {!hasLocalData && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md mb-2">
              ⚠️ No local vote data found. You cannot reveal if you switched
              devices.
            </div>
          )}

          {/* Cards mimicking the Vote Page, but read-only/highlighted */}
          <div className="flex flex-col gap-3">
            {/* Claimant Card */}
            <div
              className={`w-full p-4 rounded-lg border transition-colors text-left flex flex-col relative ${
                localVote === 1
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-gray-200 bg-white opacity-60"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">
                    Claimant
                  </span>
                  <span className="text-lg font-medium">Julio Banegas</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-mono ${localVote === 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  1
                </span>
              </div>
              {localVote === 1 && (
                <div className="absolute top-2 right-2 text-primary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Your Vote
                  </span>
                </div>
              )}
            </div>

            {/* Defendant Card */}
            <div
              className={`w-full p-4 rounded-lg border transition-colors text-left flex flex-col relative ${
                localVote === 0
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-gray-200 bg-white opacity-60"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold">
                    Defendant
                  </span>
                  <span className="text-lg font-medium">Micaela Descotte</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-mono ${localVote === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  0
                </span>
              </div>
              {localVote === 0 && (
                <div className="absolute top-2 right-2 text-primary">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Your Vote
                  </span>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Logs */}
          {isProcessing && (
            <div
              style={{
                padding: "10px",
                background: "#f3f4f6",
                fontSize: "10px",
                marginBottom: "10px",
                whiteSpace: "pre-wrap",
                borderRadius: "8px",
              }}
            >
              {logs || "Processing reveal..."}
            </div>
          )}

          {/* Main Action Button */}
          <button
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-auto shadow-lg"
            onClick={() => void handleReveal()}
            disabled={isProcessing || !hasLocalData}
          >
            {isProcessing ? "Revealing on Chain..." : "Confirm & Reveal"}
          </button>
        </div>
      </div>

      <PaginationDots currentIndex={3} total={4} />

      {showSuccessAnimation && (
        <SuccessAnimation onComplete={handleAnimationComplete} />
      )}
    </div>
  );
}
