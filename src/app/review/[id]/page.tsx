import { getReview, deleteReview, getLikeStatus, getComments } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MediaGallery } from "@/components/media-gallery";
import { StarRating } from "@/components/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, ArrowLeft } from "lucide-react";
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
    <div className="animate-fade-in">
      {/* Back navigation */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to feed
          </Link>
        </div>
      </div>

      <article className="container mx-auto max-w-4xl px-4 py-8">
        {/* Media */}
        {review.media.length > 0 && (
          <div className="overflow-hidden rounded-2xl">
            <MediaGallery items={review.media} />
          </div>
        )}

        {/* Restaurant name & rating */}
        <div className="mt-8 space-y-3">
          {review.restaurantName && (
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="size-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">{review.restaurantName}</span>
            </div>
          )}
          <StarRating value={review.rating} readonly size="md" />
        </div>

        {/* Author info */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/40 bg-card p-4">
          <Link href={`/user/${review.author.id}`}>
            <Avatar className="size-12 ring-2 ring-primary/10 transition-shadow hover:ring-primary/30">
              <AvatarImage src={review.author.image ?? ""} />
              <AvatarFallback className="text-base font-semibold">
                {review.author.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/user/${review.author.id}`}
              className="block truncate font-semibold transition-colors hover:text-primary"
            >
              {review.author.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isAuthor && (
              <EditReviewDialog
                review={{ id: review.id, text: review.text, tags: review.tags, restaurantName: review.restaurantName, rating: review.rating }}
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

        {/* Review text */}
        <div className="mt-8">
          <p className="whitespace-pre-wrap text-base leading-7 text-foreground/90">
            {review.text}
          </p>
        </div>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <Link key={tag} href={`/tag/${tag}`}>
                <Badge
                  variant="secondary"
                  className="rounded-lg px-3 py-1 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Like button */}
        <div className="mt-8 flex items-center rounded-xl border border-border/40 bg-card/50 p-4">
          <LikeButton
            reviewId={review.id}
            initialLiked={likeStatus.liked}
            initialCount={likeStatus.count}
          />
        </div>

        {/* Comments */}
        <div className="mt-10">
          <CommentSection
            reviewId={review.id}
            initialComments={comments}
            currentUserId={session?.user?.id ?? null}
          />
        </div>
      </article>
    </div>
  );
}