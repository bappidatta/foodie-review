"use client";

import { useState, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setQuery("");
  };

  return (
    <div className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search reviews..."
        className="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-52"
      />
      {query && (
        <button
          onClick={handleSearch}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Go
        </button>
      )}
    </div>
  );
}
