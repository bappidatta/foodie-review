import { getReviewsByTag } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";
import { Hash } from "lucide-react";

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
    <div className="animate-fade-in">
      {/* Tag header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Hash className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">#{tagName}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {feed.total} review{feed.total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-10">
        {feed.reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl bg-muted/50 p-6">
              <Hash className="size-10 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-muted-foreground">
              No reviews with this tag yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {feed.reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>

            {feed.total > feed.limit && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && (
                  <a
                    href={`/tag/${tagName}?page=${page - 1}`}
                    className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow-md"
                  >
                    &larr; Previous
                  </a>
                )}
                <span className="text-sm text-muted-foreground">Page {page}</span>
                {page * feed.limit < feed.total && (
                  <a
                    href={`/tag/${tagName}?page=${page + 1}`}
                    className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow-md"
                  >
                    Next &rarr;
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
