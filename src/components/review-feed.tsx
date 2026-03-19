"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { ReviewCard } from "@/components/review-card";
import { getFeed } from "@/lib/actions";
import { UtensilsCrossed, Flame, Clock, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Review, Media, User } from "@/lib/db/schema";

type ReviewWithRelations = Review & {
  author: User;
  media: Media[];
  tags: string[];
  likeCount?: number;
};

type SortKey = "newest" | "popular" | "top-rated";

const sortOptions = [
  { key: "newest" as const, label: "Latest", icon: Clock },
  { key: "popular" as const, label: "Popular", icon: Flame },
  { key: "top-rated" as const, label: "Top Rated", icon: Star },
];

const PAGE_SIZE = 12;

interface ReviewFeedProps {
  initialReviews: ReviewWithRelations[];
  initialTotal: number;
  initialSort: SortKey;
}

export function ReviewFeed({ initialReviews, initialTotal, initialSort }: ReviewFeedProps) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [reviews, setReviews] = useState<ReviewWithRelations[]>(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSwitching, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = reviews.length < total;

  // When sort changes, fetch page 1 for the new sort
  const handleSortChange = (newSort: SortKey) => {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);

    startTransition(async () => {
      try {
        const feed = await getFeed(1, PAGE_SIZE, newSort);
        setReviews(feed.reviews as ReviewWithRelations[]);
        setTotal(Number(feed.total));
      } catch {
        setReviews([]);
        setTotal(0);
      }
    });
  };

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const feed = await getFeed(nextPage, PAGE_SIZE, sort);
      setReviews((prev) => [...prev, ...(feed.reviews as ReviewWithRelations[])]);
      setTotal(Number(feed.total));
      setPage(nextPage);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, sort]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isSwitching) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, isSwitching, loadMore]);

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10">
      {/* Sort tabs */}
      <div className="mb-8 flex items-center gap-1.5 rounded-xl bg-muted/50 p-1.5 w-fit">
        {sortOptions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleSortChange(key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              sort === key
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isSwitching ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-primary/50" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="rounded-2xl bg-muted/50 p-6">
            <UtensilsCrossed className="size-12 text-muted-foreground/40" />
          </div>
          <p className="mt-6 text-lg font-medium text-muted-foreground">
            No reviews yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Be the first to share your food experience!
          </p>
          <Link
            href="/review/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <UtensilsCrossed className="size-4" />
            Write a Review
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="animate-card-enter"
                style={{ animationDelay: `${Math.min(i, 11) * 50}ms` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="mt-8 flex items-center justify-center py-4">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading more...
              </div>
            )}
            {!hasMore && reviews.length > 0 && (
              <p className="text-sm text-muted-foreground/60">
                You&apos;ve seen all {total} reviews
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
