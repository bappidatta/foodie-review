import { getReviewsByTag } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";
import { Badge } from "@/components/ui/badge";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { name } = await params;
  const { page: pageStr } = await searchParams;
  const tagName = decodeURIComponent(name);
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  let feed;
  try {
    feed = await getReviewsByTag(tagName, page);
  } catch {
    feed = { reviews: [], total: 0, page, limit: 12 };
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <Badge className="text-lg px-3 py-1">#{tagName}</Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          {feed.total} review{feed.total !== 1 ? "s" : ""} tagged #{tagName}
        </p>
      </div>

      {feed.reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No reviews with this tag yet.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feed.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {feed.total > feed.limit && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/tag/${tagName}?page=${page - 1}`}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Previous
                </a>
              )}
              {page * feed.limit < feed.total && (
                <a
                  href={`/tag/${tagName}?page=${page + 1}`}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
