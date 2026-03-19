import { getFeed } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";
import { UtensilsCrossed } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageStr, sort: sortStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const sort = (sortStr === "popular" ? "popular" : "newest") as "newest" | "popular";

  let feed;
  try {
    feed = await getFeed(page, 12, sort);
  } catch {
    feed = null;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <UtensilsCrossed className="mr-2 inline size-7 text-orange-500" />
          Foodie Review
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover and share honest food reviews
        </p>
      </div>

      {/* Sort tabs */}
      <div className="mb-6 flex gap-2">
        <a
          href={`/?sort=newest`}
          className={`rounded-md border px-4 py-1.5 text-sm transition-colors ${
            sort === "newest"
              ? "bg-foreground text-background"
              : "hover:bg-muted"
          }`}
        >
          Latest
        </a>
        <a
          href={`/?sort=popular`}
          className={`rounded-md border px-4 py-1.5 text-sm transition-colors ${
            sort === "popular"
              ? "bg-foreground text-background"
              : "hover:bg-muted"
          }`}
        >
          Popular
        </a>
      </div>

      {!feed || feed.reviews.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No reviews yet. Be the first to share!
          </p>
        </div>
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
                  href={`/?page=${page - 1}&sort=${sort}`}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Previous
                </a>
              )}
              {page * feed.limit < feed.total && (
                <a
                  href={`/?page=${page + 1}&sort=${sort}`}
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
