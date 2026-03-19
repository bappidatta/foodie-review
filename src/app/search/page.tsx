import { searchReviews } from "@/lib/actions";
import { ReviewCard } from "@/components/review-card";
import { Search, MapPin } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; page?: string }>;
}) {
  const { q, location: locationParam, page: pageStr } = await searchParams;
  const query = q?.trim() ?? "";
  const location = locationParam?.trim() ?? "";
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  if (!query && !location) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto rounded-2xl bg-muted/50 p-6 w-fit">
          <Search className="size-10 text-muted-foreground/40" />
        </div>
        <p className="mt-4 text-muted-foreground">Search by restaurant, dish, reviewer, tag, or location.</p>
      </div>
    );
  }

  let result;
  try {
    result = await searchReviews(query, page, 12, location);
  } catch {
    result = null;
  }

  const total = result?.total ?? 0;
  const searchSummary = query && location
    ? `“${query}” near “${location}”`
    : query
      ? `“${query}”`
      : `locations matching “${location}”`;
  const pageLink = (targetPage: number) =>
    `/search?${new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(location ? { location } : {}),
      page: String(targetPage),
    }).toString()}`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      <form action="/search" className="mb-8 grid gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="search-query" className="text-sm font-medium text-foreground">
            What are you looking for?
          </label>
          <input
            id="search-query"
            name="q"
            defaultValue={query}
            placeholder="Restaurant, dish, reviewer, or tag"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="search-location" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-primary" />
            Location
          </label>
          <input
            id="search-location"
            name="location"
            defaultValue={location}
            placeholder="Neighborhood, city, or address"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Search results</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {total} result{total !== 1 ? "s" : ""} for {searchSummary}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tip: reviewers now add a location when they create a restaurant, so you can search by neighborhood, city, or address.
        </p>
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
            Try different keywords, adjust the location filter, or check the spelling
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
                  href={pageLink(page - 1)}
                  className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:shadow-md"
                >
                  &larr; Previous
                </a>
              )}
              <span className="text-sm text-muted-foreground">Page {page}</span>
              {page * result.limit < result.total && (
                <a
                  href={pageLink(page + 1)}
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
