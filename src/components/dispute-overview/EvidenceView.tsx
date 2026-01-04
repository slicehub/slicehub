"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { useEvidence, EvidenceRole } from "@/hooks/useEvidence";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import {
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Mic,
  Shield,
  ArrowRight,
  ArrowLeft,
  Quote,
} from "lucide-react";
import { shortenAddress } from "@/util/wallet";

interface EvidenceViewProps {
  disputeId: string;
  role: EvidenceRole;
  nextPath: string;
  prevPath: string;
  pageIndex: number;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  disputeId,
  role,
  nextPath,
  prevPath,
  pageIndex,
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Get Data
  const { partyInfo, statement, imageEvidence, videoEvidence, audioEvidence } =
    useEvidence(disputeId, role);

  // 2. Swipe Handlers
  const { handlers } = useSwipeGesture({
    onSwipeLeft: () => router.push(nextPath),
    onSwipeRight: () => router.push(prevPath),
  });

  const handleBack = () => router.back();
  const openMedia = (url: string) => window.open(url, "_blank");

  // Determine colors based on role
  const isClaimant = role === "claimant";
  const themeColor = isClaimant ? "blue" : "gray";
  const bgGradient = isClaimant
    ? "from-blue-50/50 to-transparent"
    : "from-gray-100/50 to-transparent";

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-[#F8F9FC] font-manrope relative overflow-hidden"
      {...handlers}
    >
      {/* --- 1. FIXED HEADER --- */}
      <div className="flex-none px-6 pt-4 pb-2 z-20 bg-[#F8F9FC]/80 backdrop-blur-sm">
        <DisputeOverviewHeader onBack={handleBack} />
      </div>

      {/* --- 2. SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-2 flex flex-col gap-6 z-10 scrollbar-hide">
        {/* Identity Card */}
        <div className="relative bg-white rounded-[24px] p-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div
            className={`absolute top-0 left-0 w-full h-full rounded-[24px] bg-gradient-to-b ${bgGradient} opacity-20 pointer-events-none`}
          />

          <div className="relative bg-white rounded-[22px] p-5 border border-gray-100 overflow-hidden">
            {/* Role Strip */}
            <div
              className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-${themeColor}-500`}
            />

            <div className="flex items-center gap-4 pl-3">
              {/* Avatar with Ring */}
              <div className="relative shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border-[3px] border-white shadow-md`}
                >
                  {partyInfo.avatar ? (
                    <img
                      src={partyInfo.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Role Icon Badge */}
                {/* Use explicit classes (bg-blue-500 / bg-gray-500) instead of dynamic strings */}
                <div
                  className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center text-white ${
                    isClaimant ? "bg-blue-500" : "bg-gray-800"
                  }`}
                >
                  {isClaimant ? (
                    <User size={12} fill="currentColor" />
                  ) : (
                    <Shield size={12} fill="currentColor" />
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest text-${themeColor}-500 mb-0.5 block`}
                >
                  {partyInfo.role}
                </span>
                <h2 className="text-xl font-extrabold text-[#1b1c23] leading-tight">
                  {partyInfo.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted Dec 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statement Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#8c8fff]" /> Official
            Statement
          </h3>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative">
            <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-100 fill-gray-50" />
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium relative z-10 pt-2">
              {statement}
            </p>
          </div>
        </div>

        {/* Evidence Vault */}
        {(imageEvidence.length > 0 ||
          videoEvidence.length > 0 ||
          audioEvidence) && (
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#8c8fff]" /> Exhibits
            </h3>

            <div className="flex flex-col gap-3">
              {/* Audio Evidence */}
              {audioEvidence && (
                <div
                  onClick={() => openMedia(audioEvidence.url!)}
                  className="bg-[#1b1c23] rounded-[20px] p-4 flex items-center gap-4 shadow-lg shadow-gray-200 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md border border-white/10">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 z-10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      Audio Recording
                    </p>
                    <p className="text-base font-semibold">
                      {audioEvidence.duration}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-[#1b1c23] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <PlayCircle className="w-5 h-5 fill-current" />
                  </div>
                </div>
              )}

              {/* Grid for Visuals */}
              <div className="grid grid-cols-2 gap-3">
                {imageEvidence.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => openMedia(img.url)}
                    className="relative aspect-[4/3] bg-gray-100 rounded-[20px] overflow-hidden border border-white shadow-sm group hover:shadow-md transition-all active:scale-95"
                  >
                    <img
                      src={img.url}
                      alt="Evidence"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon className="w-2.5 h-2.5" /> IMG
                      </span>
                    </div>
                  </button>
                ))}

                {videoEvidence.map((vid) => (
                  <button
                    key={vid.id}
                    onClick={() => openMedia(vid.url)}
                    className="relative aspect-[4/3] bg-gray-900 rounded-[20px] overflow-hidden border border-white shadow-sm group hover:shadow-md transition-all active:scale-95"
                  >
                    <img
                      src={vid.thumbnail || vid.url}
                      alt="Video"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-red-500/90 px-2 py-1 rounded-lg border border-white/10">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <PlayCircle className="w-2.5 h-2.5 fill-current" /> MP4
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {imageEvidence.length === 0 &&
          videoEvidence.length === 0 &&
          !audioEvidence && (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
              <Shield className="w-12 h-12 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No Evidence Submitted
              </p>
            </div>
          )}
      </div>

      {/* --- 3. NAVIGATION DOCK --- */}
      <div className="flex-none p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <div className="relative bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 p-2 flex items-center justify-between min-h-[72px]">
          {/* 1. ABSOLUTE CENTERED DOTS */}
          {/* Pointer-events-none ensures clicks pass through to buttons if they overlap on tiny screens */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <PaginationDots currentIndex={pageIndex} total={4} />
          </div>

          {/* 2. BACK BUTTON (Left) */}
          <button
            onClick={() => router.push(prevPath)}
            className="relative z-10 flex items-center gap-3 px-2 py-2 pr-4 rounded-[18px] hover:bg-gray-50 active:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-[#1b1c23]" />
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-[#1b1c23] hidden sm:block">
              Back
            </span>
          </button>

          {/* 3. NEXT BUTTON (Right) */}
          <button
            onClick={() => router.push(nextPath)}
            className="relative z-10 flex items-center gap-3 px-2 py-2 pl-4 rounded-[18px] hover:bg-gray-50 active:bg-gray-100 transition-all group"
          >
            <span className="text-xs font-bold text-gray-600 group-hover:text-[#1b1c23] hidden sm:block">
              Next
            </span>
            <div className="w-10 h-10 rounded-full bg-[#1b1c23] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform group-active:scale-95">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
