import { searchReviews } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  if (!query) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto rounded-2xl bg-muted/50 p-6 w-fit">
          <Search className="size-10 text-muted-foreground/40" />
        </div>
        <p className="mt-4 text-muted-foreground">Enter a search term to find reviews.</p>
      </div>
    );
  }

  let result;
  try {
    result = await searchReviews(query, page);
  } catch {
    result = null;
  }

  const total = result?.total ?? 0;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Search results</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </h1>
      </div>

      {!result || result.reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl bg-muted/50 p-6">
            <Search className="size-10 text-muted-foreground/40" />
          </div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No reviews found
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Try different keywords or check the spelling
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.reviews.map((review, i) => (
              <div
                key={review.id}
                className="animate-card-enter"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {result.total > result.limit && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {page > 1 && (
                <a
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow-md"
                >
                  &larr; Previous
                </a>
              )}
              <span className="text-sm text-muted-foreground">Page {page}</span>
              {page * result.limit < result.total && (
                <a
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow-md"
                >
                  Next &rarr;
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
