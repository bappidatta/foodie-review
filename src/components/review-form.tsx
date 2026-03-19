"use client";

import { useState } from "react";
import { createReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/media-upload";
import { TagInput } from "@/components/tag-input";
import { Loader2 } from "lucide-react";

export function ReviewForm() {
  const [text, setText] = useState("");
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
      formData.set("tags", tags.join(","));
      formData.set("media", JSON.stringify(media));
      await createReview(formData);
    } catch {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="media">Photos & Videos</Label>
        <MediaUpload value={media} onChange={setMedia} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text">Your Review</Label>
        <Textarea
          id="review-text"
          placeholder="What did you eat? How was it? Share your experience..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {text.length}/1000
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <Button type="submit" className="w-full" disabled={pending || !text.trim()}>
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Review"
        )}
      </Button>
    </form>
  );
}
