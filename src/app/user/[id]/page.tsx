import { getUserProfile } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/review-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, FileText } from "lucide-react";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let profile;
  try {
    profile = await getUserProfile(id);
  } catch {
    notFound();
  }
  if (!profile) notFound();

  const { user, reviews } = profile;

  return (
    <div className="animate-fade-in">
      {/* Profile header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Avatar className="size-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="text-3xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="size-4" />
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-lg font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl bg-muted/50 p-6">
              <FileText className="size-10 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-muted-foreground">
              No reviews yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="animate-card-enter"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
