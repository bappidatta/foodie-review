import { getFeed } from "@/lib/actions";
import { ReviewFeed } from "@/components/review-feed";
import { UtensilsCrossed } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortStr } = await searchParams;
  const validSorts = ["newest", "popular", "top-rated"] as const;
  const sort = validSorts.includes(sortStr as typeof validSorts[number])
    ? (sortStr as typeof validSorts[number])
    : "newest";

  let feed;
  try {
    feed = await getFeed(1, 12, sort);
  } catch {
    feed = null;
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <UtensilsCrossed className="size-4" />
            Discover Amazing Food
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Share Your{" "}
            <span className="text-gradient">Food Adventures</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Discover honest reviews, share your culinary experiences, and find your next favorite meal.
          </p>
        </div>
      </section>

      {/* Feed Section — client component with sort tabs + infinite scroll */}
      <ReviewFeed
        initialReviews={feed?.reviews ?? []}
        initialTotal={feed ? Number(feed.total) : 0}
        initialSort={sort}
      />
    </div>
  );
}
