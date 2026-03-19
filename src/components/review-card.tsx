"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Film, Heart, MapPin, Star } from "lucide-react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='none'%3E%3Crect width='400' height='300' rx='8' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='14' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";
import type { Review, Media, User } from "@/lib/db/schema";

interface ReviewCardProps {
  review: Review & {
    author: User;
    media: Media[];
    tags: string[];
    likeCount?: number;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const firstMedia = review.media[0];

  return (
    <Link href={`/review/${review.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:border-border/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Media preview */}
        {firstMedia && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {firstMedia.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstMedia.url}
                alt="Food review"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
              />
            ) : (
              <div className="relative h-full w-full">
                <video
                  src={firstMedia.url}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Film className="size-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Media count */}
            {review.media.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                +{review.media.length - 1} more
              </span>
            )}

            {/* Rating pill */}
            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-white">{review.rating}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Restaurant name */}
          {review.restaurantName && (
            <div className="mb-2 flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate text-sm font-semibold text-primary">{review.restaurantName}</span>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7 ring-2 ring-background">
              <AvatarImage src={review.author.image ?? ""} />
              <AvatarFallback className="text-xs font-medium">
                {review.author.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{review.author.name}</span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* Rating (shown when no media) */}
          {!firstMedia && (
            <div className="mt-2 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4 ${
                    s <= review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Review text */}
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {review.text}
          </p>

          {/* Tags & likes */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-1">
              {review.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-normal">
                  #{tag}
                </Badge>
              ))}
              {review.tags.length > 3 && (
                <span className="text-[11px] text-muted-foreground">
                  +{review.tags.length - 3}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
              <Heart className="size-3.5" />
              <span className="text-xs font-medium">{review.likeCount ?? 0}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
