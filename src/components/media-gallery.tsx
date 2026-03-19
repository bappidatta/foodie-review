"use client";

import { useState } from "react";
import { Film, ImageOff } from "lucide-react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='none'%3E%3Crect width='400' height='300' rx='8' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='14' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";

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
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-inner">
        {active.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt="Food review media"
            className="h-full w-full object-contain transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
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
              className={`relative size-18 shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
                i === activeIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
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
