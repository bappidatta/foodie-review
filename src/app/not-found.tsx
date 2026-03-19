import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center animate-fade-in">
      <div className="rounded-2xl bg-muted/50 p-6">
        <UtensilsCrossed className="size-12 text-muted-foreground/30" />
      </div>
      <div>
        <h1 className="text-6xl font-extrabold tracking-tight text-foreground/20">404</h1>
        <p className="mt-2 text-lg font-medium text-muted-foreground">
          This page doesn&apos;t exist
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Maybe the recipe was too good to share
        </p>
      </div>
      <Link href="/">
        <Button className="rounded-xl">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Feed
        </Button>
      </Link>
    </div>
  );
}
