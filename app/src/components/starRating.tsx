import React, { useState, useRef } from "react";

interface StarRatingProps {
  value: number; // 0-20 scale
  onChange: (newValue: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean; // Whether to show the numeric value
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = "md",
  showValue = true,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const handleStarClick = (
    starIndex: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (disabled) return;

    const star = starRefs.current[starIndex];
    if (!star) return;

    const rect = star.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const starWidth = rect.width;
    const clickPercentage = clickX / starWidth;

    // Determine if it's left half (0.5 star) or right half (full star)
    const baseValue = starIndex * 2; // 0, 2, 4, 6, etc.
    const newValue = clickPercentage < 0.5 ? baseValue + 1 : baseValue + 2;

    onChange(Math.max(0, Math.min(20, newValue))); // Clamp between 0-20
  };

  const handleStarHover = (
    starIndex: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    if (disabled) return;

    const star = starRefs.current[starIndex];
    if (!star) return;

    const rect = star.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const starWidth = rect.width;
    const hoverPercentage = hoverX / starWidth;

    const baseValue = starIndex * 2;
    const hoverRating = hoverPercentage < 0.5 ? baseValue + 1 : baseValue + 2;

    setHoverValue(Math.max(0, Math.min(20, hoverRating)));
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  const renderStar = (starIndex: number) => {
    const starValue = (starIndex + 1) * 2; // Full star threshold (2, 4, 6, 8, etc.)
    const halfStarValue = starValue - 1; // Half star threshold (1, 3, 5, 7, etc.)

    let starContent;

    if (displayValue >= starValue) {
      // Full star
      starContent = <span className="text-yellow-400">★</span>;
    } else if (displayValue >= halfStarValue) {
      // Half star
      starContent = (
        <span className="relative inline-block text-yellow-400">
          <span className="opacity-30">★</span>
          <span
            className="absolute inset-0 overflow-hidden opacity-100"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
          >
            ★
          </span>
        </span>
      );
    } else {
      // Empty star
      starContent = <span className="text-yellow-400 opacity-30">★</span>;
    }

    return (
      <span
        key={starIndex}
        ref={(el) => {
          starRefs.current[starIndex] = el;
        }}
        className={`
          relative inline-block cursor-pointer select-none transition-transform
          ${sizeClasses[size]}
          ${disabled ? "cursor-not-allowed opacity-50" : "hover:scale-110"}
        `}
        onClick={(e) => handleStarClick(starIndex, e)}
        onMouseMove={(e) => handleStarHover(starIndex, e)}
        onMouseLeave={handleMouseLeave}
        style={{ minWidth: "1.2em" }} // Ensure consistent click area
      >
        {starContent}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => renderStar(i))}
      </div>

      {showValue && (
        <span
          className={`ml-2 text-gray-500 dark:text-gray-400 ${
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          }`}
        >
          {(displayValue / 2).toFixed(1)}/10
        </span>
      )}
    </div>
  );
}
