"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment, deleteComment } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
  id: string;
  text: string;
  createdAt: Date | string;
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  };
}

interface CommentSectionProps {
  reviewId: string;
  initialComments: Comment[];
  currentUserId?: string | null;
}

export function CommentSection({
  reviewId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const comment = await createComment(reviewId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const isOwner = (authorId: string | null) =>
    currentUserId === authorId || session?.user?.id === authorId;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={comment.author.image ?? ""} />
                <AvatarFallback className="text-xs">
                  {comment.author.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.author.name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {isOwner(comment.author.id) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/500</span>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !text.trim()}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline">
            Sign in
          </Link>{" "}
          to comment
        </p>
      )}
    </div>
  );
}
