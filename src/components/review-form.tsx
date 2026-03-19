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

export function ReviewForm() {
  const [text, setText] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPending(true);
    try {
      const formData = new FormData();
      formData.set("text", text);
      formData.set("restaurantName", restaurantName);
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
          maxLength={200}
          className="h-11 rounded-xl"
        />
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
