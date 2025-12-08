import React from "react";
import { useRouter } from "next/navigation";
import { DisputeCard } from "./DisputeCard";
import { BarChartIcon } from "./icons/Icon";
import { FilterIcon } from "./icons/BadgeIcons";
import styles from "./DisputesList.module.css";
import { Plus } from "lucide-react";

export interface Dispute {
  id: string;
  title: string;
  icon?: string;
  category: string;
  votesCount: number;
  totalVotes: number;
  prize: string;
  userVote?: "approve" | "reject";
  voters: Array<{
    name: string;
    avatar?: string;
    vote: "approve" | "reject";
  }>;
}

// Mock data - in production would come from the contract
const mockDisputes: Dispute[] = [
  {
    id: "1",
    title: "Stellar Community Fund",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
  {
    id: "2",
    title: "Ethereum Fundation",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
  {
    id: "3",
    title: "Lionstar",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
];

export const DisputesList: React.FC = () => {
  const router = useRouter();

  const handleJusticeClick = () => {
    router.push("/category-amount");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.icon}>
            <BarChartIcon />
          </div>
          <h2 className={styles.title}>My disputes:</h2>
        </div>
        <button
          onClick={() => router.push("/create")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="text-xl leading-none mb-1 text-[#1b1c23]">
            <Plus />
          </span>
        </button>
        <button className={styles.filterButton}>
          <span>Add Filter</span>
          <FilterIcon size={12} />
        </button>
      </div>

      <div className={styles.disputesContainer}>
        {mockDisputes.map((dispute) => (
          <DisputeCard key={dispute.id} dispute={dispute} />
        ))}
      </div>

      <button className={styles.justiceButton} onClick={handleJusticeClick}>
        Make Justice
      </button>
    </div>
  );
};
