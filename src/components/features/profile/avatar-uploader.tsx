"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar } from "@/lib/api/profile";
import { useAuth } from "@/store/auth";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

function avatarInitials(name?: string | null): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("blob")); return; }
          // Use the blob's actual type — canvas may return PNG on some browsers
          // even when JPEG is requested (spec allows fallback to PNG).
          const ext = blob.type === "image/png" ? "avatar.png" : "avatar.jpg";
          resolve(new File([blob], ext, { type: blob.type }));
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function AvatarUploader() {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  // imgSrc: either blob URL during upload or real CDN URL after success
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (file: File) => {
      const compressed = await compressImage(file);
      return uploadAvatar(compressed);
    },
    onSuccess: (updated) => {
      updateUser({ avatarUrl: updated.avatarUrl });
      setImgSrc(updated.avatarUrl);
      setImgError(false);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      setImgSrc(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show optimistic preview immediately
    setImgSrc(URL.createObjectURL(file));
    setImgError(false);
    mutate(file);
    e.target.value = "";
  };

  // Resolve display src: explicit imgSrc overrides store value
  const displaySrc = imgSrc ?? (imgError ? null : (user?.avatarUrl ?? null));

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className={cn(
          "group relative h-32 w-32 overflow-hidden rounded-full ring-2 ring-teal-500/30 transition hover:ring-teal-500",
          isPending && "opacity-70",
        )}
        aria-label="Загрузить фото профиля"
      >
        {displaySrc ? (
          // Plain <img> — avoids next/image fill quirks; unoptimized anyway
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt="Аватар"
            className="h-full w-full object-cover"
            onError={() => {
              setImgSrc(null);
              setImgError(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-teal-100 text-[30px] font-extrabold text-teal-700">
            {avatarInitials(user?.name)}
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          {isPending ? (
            <Spinner size={20} />
          ) : (
            <Camera className="h-6 w-6 text-white" aria-hidden="true" />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
      {error && (
        <p className="text-caption text-error">Ошибка загрузки. Попробуйте другой файл.</p>
      )}
    </div>
  );
}
