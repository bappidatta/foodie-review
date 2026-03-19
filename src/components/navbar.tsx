import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-bold text-lg transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </div>
          <span className="hidden bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:inline">
            Foodie Review
          </span>
        </Link>
        <SearchBar />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
