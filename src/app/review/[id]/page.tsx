import { getReview, deleteReview, getLikeStatus, getComments } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MediaGallery } from "@/components/media-gallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { EditReviewDialog } from "@/components/edit-review-dialog";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [review, likeStatus, comments] = await Promise.all([
    getReview(id),
    getLikeStatus(id),
    getComments(id),
  ]);
  if (!review) notFound();

  const session = await auth();
  const isAuthor = session?.user?.id === review.authorId;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Media */}
      {review.media.length > 0 && (
        <MediaGallery items={review.media} />
      )}

      {/* Author info */}
      <div className="mt-6 flex items-center gap-3">
        <Link href={`/user/${review.author.id}`}>
          <Avatar className="size-10">
            <AvatarImage src={review.author.image ?? ""} />
            <AvatarFallback>
              {review.author.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link
            href={`/user/${review.author.id}`}
            className="font-medium hover:underline"
          >
            {review.author.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {isAuthor && (
            <EditReviewDialog
              review={{ id: review.id, text: review.text, tags: review.tags }}
            />
          )}
          {isAuthor && (
            <form
              action={async () => {
                "use server";
                await deleteReview(id);
              }}
            >
              <Button variant="ghost" size="sm" type="submit" className="text-destructive">
                <Trash2 className="mr-1 size-4" />
                Delete
              </Button>
            </form>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Review text */}
      <p className="whitespace-pre-wrap text-base leading-relaxed">
        {review.text}
      </p>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Link key={tag} href={`/tag/${tag}`}>
              <Badge variant="secondary" className="hover:bg-muted-foreground/20">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Like button */}
      <div className="mt-6">
        <LikeButton
          reviewId={review.id}
          initialLiked={likeStatus.liked}
          initialCount={likeStatus.count}
        />
      </div>

      <Separator className="my-6" />

      {/* Comments */}
      <CommentSection
        reviewId={review.id}
        initialComments={comments}
        currentUserId={session?.user?.id ?? null}
      />
    </div>
  );
}