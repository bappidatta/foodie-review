"use client";

import { useState } from "react";
import { createReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/media-upload";
import { TagInput } from "@/components/tag-input";
import { StarRating } from "@/components/star-rating";
import { Loader2, MapPin, Camera, MessageSquare, Hash } from "lucide-react";

interface ReviewFormProps {
  suggestions?: {
    restaurantName: string;
    location: string;
  }[];
}

export function ReviewForm({ suggestions = [] }: ReviewFormProps) {
  const [text, setText] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [pending, setPending] = useState(false);
  const restaurantSuggestions = Array.from(new Set(suggestions.map((item) => item.restaurantName.trim()).filter(Boolean)));
  const locationSuggestions = Array.from(new Set(suggestions.map((item) => item.location.trim()).filter(Boolean)));
  const mapsPreview = [restaurantName.trim(), location.trim()].filter(Boolean).join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPending(true);
    try {
      const formData = new FormData();
      formData.set("text", text);
      formData.set("restaurantName", restaurantName);
      formData.set("location", location);
      formData.set("rating", String(rating));
      formData.set("tags", tags.join(","));
      formData.set("media", JSON.stringify(media));
      await createReview(formData);
    } catch {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="restaurant-name" className="flex items-center gap-1.5 text-sm font-semibold">
          <MapPin className="size-4 text-primary" />
          Restaurant / Place
        </Label>
        <Input
          id="restaurant-name"
          placeholder="e.g. Joe's Pizza, Mom's Kitchen..."
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          list="restaurant-suggestions"
          maxLength={200}
          className="h-11 rounded-xl"
        />
        {restaurantSuggestions.length > 0 && (
          <datalist id="restaurant-suggestions">
            {restaurantSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
        <p className="text-xs text-muted-foreground">
          Start typing to reuse an existing restaurant, or enter a new one for a fresh listing.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurant-location" className="flex items-center gap-1.5 text-sm font-semibold">
          <MapPin className="size-4 text-primary" />
          Location
        </Label>
        <Input
          id="restaurant-location"
          placeholder="Neighborhood, city, or full address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          list="location-suggestions"
          maxLength={200}
          className="h-11 rounded-xl"
        />
        {locationSuggestions.length > 0 && (
          <datalist id="location-suggestions">
            {locationSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
        <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Recommended review flow</p>
          <p className="mt-1">
            First pick an existing restaurant if you see it in the suggestions. If not, create a new one by adding the
            restaurant name and a clear location. We use that combined place label to open Google Maps for readers.
          </p>
          {mapsPreview && (
            <p className="mt-2 text-xs">
              Google Maps preview query: <span className="font-medium text-foreground">{mapsPreview}</span>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          Rating
        </Label>
        <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="media" className="flex items-center gap-1.5 text-sm font-semibold">
          <Camera className="size-4 text-primary" />
          Photos & Videos
        </Label>
        <MediaUpload value={media} onChange={setMedia} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text" className="flex items-center gap-1.5 text-sm font-semibold">
          <MessageSquare className="size-4 text-primary" />
          Your Review
        </Label>
        <Textarea
          id="review-text"
          placeholder="What did you eat? How was it? Share your experience..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={5}
          required
          className="min-h-[120px] rounded-xl resize-none"
        />
        <div className="flex justify-end">
          <span className={`text-xs ${text.length > 900 ? "text-destructive" : "text-muted-foreground"}`}>
            {text.length}/1000
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <Hash className="size-4 text-primary" />
          Tags
        </Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={pending || !text.trim()}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Review"
        )}
      </Button>
    </form>
  );
}
