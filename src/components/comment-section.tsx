"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2, MessageCircle, Send } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-primary" />
        <h3 className="text-lg font-semibold">
          Comments
        </h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {comments.length}
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-8 text-center">
          <MessageCircle className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group/comment flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <Link href={`/user/${comment.author.id}`}>
                <Avatar className="size-8 shrink-0 ring-1 ring-border/50">
                  <AvatarImage src={comment.author.image ?? ""} />
                  <AvatarFallback className="text-xs font-medium">
                    {comment.author.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/user/${comment.author.id}`}
                    className="text-sm font-semibold transition-colors hover:text-primary"
                  >
                    {comment.author.name ?? "Anonymous"}
                  </Link>
                  <span className="text-xs text-muted-foreground/70">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {isOwner(comment.author.id) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto rounded-lg p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover/comment:opacity-100"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            rows={3}
            className="min-h-[80px] rounded-xl resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${text.length > 450 ? "text-destructive" : "text-muted-foreground/60"}`}>
              {text.length}/500
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !text.trim()}
              className="rounded-lg"
            >
              <Send className="mr-1.5 size-3.5" />
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}
    </div>
  );
}
