import React, { useRef, useState, useEffect } from "react";
import styles from "./CategoryAmountHeader.module.css";

interface CategoryAmountHeaderProps {
  onBack: () => void;
  onCategorySelect?: (category: string) => void;
}

const CATEGORIES = [
  { id: "General", label: "General Court" },
  { id: "Tech", label: "Tech & Software" },
  { id: "Freelance", label: "Freelance & Services" },
  { id: "E-Commerce", label: "E-Commerce" },
];

export const CategoryAmountHeader: React.FC<CategoryAmountHeaderProps> = ({ 
  onBack, 
  onCategorySelect 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for click-outside detection
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      if (videoRef.current.duration) {
        videoRef.current.currentTime = videoRef.current.duration;
      }
    }
  };

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category.label);
    setIsOpen(false);
    if (onCategorySelect) {
      onCategorySelect(category.id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={onBack}>
        <img 
          src="/images/category-amount/back-arrow.svg" 
          alt="Back" 
          className={styles.backIcon}
        />
      </button>
      
      {/* Dropdown Container */}
      <div className={styles.dropdownWrapper} ref={dropdownRef}>
        <button 
          className={`${styles.categoryButton} ${isOpen ? styles.active : ''}`} 
          onClick={handleToggle}
          type="button"
        >
          <div className={styles.categoryIcon}>
            <video 
              ref={videoRef}
              src="/animations/category.mp4" 
              autoPlay
              muted
              playsInline
              className={styles.categoryVideo}
              onEnded={handleVideoEnded}
            />
          </div>
          <span className={styles.categoryText}>
            {selectedCategory || "Select a category"}
          </span>
          <img 
            src="/images/category-amount/chevron-down.svg" 
            alt="Dropdown" 
            className={styles.chevronIcon}
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s' 
            }}
          />
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`${styles.dropdownItem} ${selectedCategory === category.label ? styles.selectedItem : ''}`}
                onClick={() => handleSelect(category)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};