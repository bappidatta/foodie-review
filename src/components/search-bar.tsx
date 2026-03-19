"use client";

import { useState, FormEvent } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-xl border bg-muted/50 px-3.5 py-2 transition-all duration-200 ${
        focused
          ? "border-primary/40 bg-background shadow-sm ring-2 ring-primary/10"
          : "border-transparent hover:bg-muted/80"
      }`}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const nextValue = e.target.value;
          setQuery(nextValue);
          if (!nextValue.trim() && pathname === "/search") {
            router.push("/");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            e.currentTarget.blur();
            if (pathname === "/search") {
              router.push("/");
            }
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search reviews or locations..."
        className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 sm:w-56"
      />
      {query && (
        <button
          type="submit"
          className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Go
        </button>
      )}
    </form>
  );
}
