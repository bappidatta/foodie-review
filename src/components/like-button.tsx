"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { likeReview } from "@/lib/actions";
import { toast } from "sonner";

interface LikeButtonProps {
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ reviewId, initialLiked, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!session?.user) {
      toast.error("Sign in to like reviews");
      return;
    }

    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setPending(true);

    try {
      const result = await likeReview(reviewId);
      setLiked(result.liked);
      setCount(result.count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error("Failed to update like");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={liked ? "Unlike review" : "Like review"}
      className={`group/like flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 ${
        liked
          ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
          : "text-muted-foreground hover:bg-muted hover:text-red-400"
      }`}
    >
      <Heart
        className={`size-5 transition-transform duration-200 group-hover/like:scale-110 ${
          liked ? "fill-current" : ""
        }`}
      />
      <span>{count}</span>
    </button>
  );
}
