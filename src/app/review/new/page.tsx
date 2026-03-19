import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function NewReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Write a Review</h1>
          <p className="text-sm text-muted-foreground">
            Share your food experience with photos, videos, and tags
          </p>
        </CardHeader>
        <CardContent>
          <ReviewForm />
        </CardContent>
      </Card>
    </div>
  );
}
