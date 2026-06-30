"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { normalizeMediaUrl } from "@/lib/utils/media-url";

interface DriverAvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-caption",
  md: "h-10 w-10 text-body",
  lg: "h-14 w-14 text-h2",
} as const;

const sizePx = { sm: 32, md: 40, lg: 56 } as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function DriverAvatar({ name, src, size = "sm", className }: DriverAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset failed state when src changes (new upload or data refresh)
  useEffect(() => { setFailed(false); }, [src]);

  const base = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700",
    sizeClasses[size],
    className,
  );

  const normalizedSrc = normalizeMediaUrl(src);

  if (normalizedSrc && !failed) {
    return (
      <span className={cn(base, "overflow-hidden")}>
        <Image
          src={normalizedSrc}
          alt={name}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={base} aria-label={name}>
      {initials(name)}
    </span>
  );
}
