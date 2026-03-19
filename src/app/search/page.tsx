import { searchReviews } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";

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
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <p className="text-muted-foreground">Enter a search term to find reviews.</p>
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
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </h1>
      </div>

      {!result || result.reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No reviews found for &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {result.total > result.limit && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Previous
                </a>
              )}
              {page * result.limit < result.total && (
                <a
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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
