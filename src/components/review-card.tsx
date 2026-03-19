import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Film, Heart } from "lucide-react";
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
    <Link href={`/review/${review.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        {/* Media preview */}
        {firstMedia && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {firstMedia.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstMedia.url}
                alt="Food review"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="relative h-full w-full">
                <video
                  src={firstMedia.url}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="size-10 text-white drop-shadow-lg" />
                </div>
              </div>
            )}
            {review.media.length > 1 && (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                +{review.media.length - 1}
              </span>
            )}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={review.author.image ?? ""} />
              <AvatarFallback className="text-xs">
                {review.author.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{review.author.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="line-clamp-3 text-sm">{review.text}</p>
        </CardContent>

        {review.tags.length > 0 && (
          <CardFooter className="flex-wrap gap-1 pt-0 pb-1">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </CardFooter>
        )}

        <CardFooter className="pt-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="size-3" />
            <span>{review.likeCount ?? 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
