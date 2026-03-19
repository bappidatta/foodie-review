import { getUserProfile } from "@/lib/actions";
import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/review-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* User header */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback className="text-xl">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} ·
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No reviews yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
