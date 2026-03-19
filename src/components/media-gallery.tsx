"use client";

import { useState } from "react";
import { Film } from "lucide-react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

export function MediaGallery({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {active.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt="Food review media"
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            src={active.url}
            controls
            className="h-full w-full object-contain"
            controlsList="nodownload"
          />
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === activeIndex
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Film className="size-5 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
