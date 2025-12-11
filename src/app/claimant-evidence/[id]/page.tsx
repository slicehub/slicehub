"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDispute } from "@/hooks/useGetDispute";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { DeadlineCard } from "@/components/dispute-overview/DeadlineCard";
import { ClaimantInfoCard } from "@/components/claimant-evidence/ClaimantInfoCard";
import { DemandDetailSection } from "@/components/claimant-evidence/DemandDetailSection";
import { EvidenceCarousel } from "@/components/claimant-evidence/EvidenceCarousel";
import { EvidenceList } from "@/components/claimant-evidence/EvidenceList";
import { VideoEvidenceList } from "@/components/claimant-evidence/VideoEvidenceList";
import { AudioEvidenceList } from "@/components/claimant-evidence/AudioEvidenceList";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";

export default function ClaimantEvidencePage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handleBack = () => {
    router.back();
  };

  // Minimum distance to consider a swipe (50px)
  const minSwipeDistance = 50;

  // Touch events
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

    // Only prevent scroll if movement is primarily horizontal
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const deltaX = startX.current - endX;
      const deltaY = startY.current - endY;

      // Only consider horizontal swipe if horizontal movement is greater than vertical
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          // Swipe left (slide left = navigate right/defendant)
          router.push(`/defendant-evidence/${disputeId}`);
        } else {
          // Swipe right (slide right = navigate left/back)
          router.push(`/disputes/${disputeId}`);
        }
      }

      startX.current = null;
      startY.current = null;
      isDragging.current = false;
    },
    [router, disputeId],
  );

  // Mouse events for desktop development
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback(() => {
    if (
      !isDragging.current ||
      startX.current === null ||
      startY.current === null
    )
      return;
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const endX = e.clientX;
      const endY = e.clientY;
      const deltaX = startX.current - endX;
      const deltaY = startY.current - endY;

      // Only consider horizontal swipe if horizontal movement is greater than vertical
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          // Swipe left (slide left = navigate right/defendant)
          router.push(`/defendant-evidence/${disputeId}`);
        } else {
          // Swipe right (slide right = navigate left/back)
          router.push(`/disputes/${disputeId}`);
        }
      }

      startX.current = null;
      startY.current = null;
      isDragging.current = false;
    },
    [router, disputeId],
  );

  // Cleanup when component unmounts
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

  // Mock data - in production would come from the contract
  const claimantData = {
    name: "Julio Banegas",
    role: "Claimant",
    avatar: "/images/profiles-mockup/profile-1.png",
  };

  const demandDetail = "I was hired to develop a React Native mobile application. The agreed milestone was a functional MVP delivered by October 1st. I delivered the code on September 28th via GitHub, but the client has refused to release the 50% remaining escrow payment, citing 'quality issues' that were never specified in our initial contract.";

  // Images for the top carousel (after the demand detail)
  const topCarouselImages = [
    {
      id: "carousel-1",
      url: "/images/category-amount/evidencia-1.png",
      description: "Evidence 1",
    },
    {
      id: "carousel-2",
      url: "/images/category-amount/evidencia-2.png",
      description: "Evidence 2",
    },
  ];

  const { dispute } = useGetDispute(disputeId);

  const dynamicEvidence = (dispute?.evidence || []).map((url: string, index: number) => ({
    id: `evidence-${index}`,
    type: url.endsWith('.mp4') ? ('video' as const) : ('image' as const),
    url: url,
    description: "Evidence submitted via IPFS",
    uploadDate: "Recently",
    thumbnail: url.endsWith('.mp4') ? "/images/category-amount/evidencia-video.png" : undefined
  }));

  const imageEvidenceList = dynamicEvidence
    .filter((e) => e.type === 'image')
    .map(e => ({...e, type: 'image' as const}));

  const videoEvidenceList = dynamicEvidence
    .filter((e) => e.type === 'video')
    .map(e => ({...e, type: 'video' as const}));

  const audioEvidence = {
    id: "a1",
    title: "Claimant's audio",
    duration: "1:45min",
    progress: 43, // 43% de progreso
  };

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
      <DeadlineCard deadline="14/12/2025" />
      <div className="flex-1 overflow-y-auto p-4">
        <ClaimantInfoCard claimant={claimantData} />
        <DemandDetailSection detail={demandDetail} />
        <EvidenceCarousel images={topCarouselImages} />
        <div className="flex flex-col gap-4 mt-6">
          <h3 className="text-md font-bold mb-2 mx-4">Evidence:</h3>
        </div>
        <EvidenceList evidenceList={imageEvidenceList} />
        <VideoEvidenceList evidenceList={videoEvidenceList} />
        <AudioEvidenceList audio={audioEvidence} />
      </div>
      <PaginationDots currentIndex={1} total={4} />
    </div>
  );
}
