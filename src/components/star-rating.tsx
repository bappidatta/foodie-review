"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-6",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const starSize = sizeMap[size];

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hovered ? star <= hovered : star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer"
            } ${active ? "text-amber-400" : "text-muted-foreground/30"}`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`${starSize} ${active ? "fill-current" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
