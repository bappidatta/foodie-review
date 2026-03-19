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
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all active:scale-90 disabled:opacity-50 ${
        liked
          ? "text-red-500 hover:text-red-400"
          : "text-muted-foreground hover:text-red-400"
      }`}
    >
      <Heart className={`size-5 ${liked ? "fill-current" : ""}`} />
      <span className="font-medium">{count}</span>
    </button>
  );
}
