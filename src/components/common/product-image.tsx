"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
}

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.8rem] border border-app-border bg-[radial-gradient(circle_at_center,var(--app-primary-soft),transparent_56%)]",
        className,
      )}
    >
      {hasError ? (
        <div className="grid h-full min-h-52 place-items-center bg-app-surface text-app-text-muted">
          <div className="flex flex-col items-center gap-2">
            <ImageOff className="size-6" />
            <span className="locale-label text-sm uppercase">Image unavailable</span>
          </div>
        </div>
      ) : (
        <Image
          fill
          alt={alt}
          sizes={sizes}
          src={src}
          className={cn("object-contain p-5", imageClassName)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
