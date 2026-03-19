import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function NewReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="animate-fade-in">
      {/* Back navigation */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to feed
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" />
            New Review
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Write a Review</h1>
          <p className="mt-2 text-muted-foreground">
            Share your food experience with photos, videos, and tags
          </p>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
