"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/tag-input";
import { StarRating } from "@/components/star-rating";
import { updateReview } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditReviewDialogProps {
  review: {
    id: string;
    text: string;
    tags: string[];
    restaurantName: string;
    location: string;
    rating: number;
  };
}

export function EditReviewDialog({ review }: EditReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.text);
  const [restaurantName, setRestaurantName] = useState(review.restaurantName);
  const [location, setLocation] = useState(review.location);
  const [rating, setRating] = useState(review.rating);
  const [tagList, setTagList] = useState<string[]>(review.tags);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await updateReview(review.id, {
        text: text.trim(),
        tags: tagList,
        restaurantName,
        location,
        rating,
      });
      toast.success("Review updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setText(review.text);
    setRestaurantName(review.restaurantName);
    setLocation(review.location);
    setRating(review.rating);
    setTagList(review.tags);
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="mr-1 size-4" />
        Edit
      </Button>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Edit Review</h3>
        <button
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close edit form"
        >
          <X className="size-4" />
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Restaurant / Place</p>
        <Input
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          placeholder="e.g. Joe's Pizza"
          maxLength={200}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Location</p>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Neighborhood, city, or address"
          maxLength={200}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Rating</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        rows={5}
        placeholder="Review text..."
      />

      <div>
        <p className="mb-1.5 text-sm font-medium">Tags</p>
        <TagInput value={tagList} onChange={setTagList} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !text.trim()}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
