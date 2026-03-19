"use client";

import { useCallback, useState } from "react";
import { Upload, X, Film, ImageIcon } from "lucide-react";

const FALLBACK_IMG = "/fallback-food.svg";
import { Button } from "@/components/ui/button";

interface MediaItem {
  url: string;
  type: "image" | "video";
  preview?: string;
}

interface MediaUploadProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxFiles?: number;
}

export function MediaUpload({
  value,
  onChange,
  maxFiles = 5,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (value.length + files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);
      try {
        const newItems: MediaItem[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            alert(err.error || "Upload failed");
            continue;
          }

          const data = await res.json();
          newItems.push({
            url: data.url,
            type: data.type,
          });
        }
        onChange([...value, ...newItems]);
      } finally {
        setUploading(false);
        // Reset input so same file can be selected again
        e.target.value = "";
      }
    },
    [value, onChange, maxFiles]
  );

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((item, i) => (
          <div
            key={i}
            className="group relative aspect-square rounded-lg border bg-muted overflow-hidden"
          >
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt="Upload preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  muted
                />
                <Film className="absolute size-8 text-white drop-shadow-lg" />
              </div>
            )}
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground">
            {uploading ? (
              <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Upload className="size-6" />
                <span className="text-xs">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        <ImageIcon className="mr-1 inline size-3" />
        Images (max 5MB) &nbsp;
        <Film className="mr-1 inline size-3" />
        Videos (max 50MB, 30s) — up to {maxFiles} files
      </p>
    </div>
  );
}
