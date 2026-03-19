import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { SearchBar } from "@/components/search-bar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-lg">
          <UtensilsCrossed className="size-5 text-orange-500" />
          <span className="hidden sm:inline">Foodie Review</span>
        </Link>
        <SearchBar />
        <AuthButton />
      </div>
    </header>
  );
}
