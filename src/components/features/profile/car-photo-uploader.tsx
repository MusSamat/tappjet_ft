"use client";

import { useRef, useState } from "react";
import { Camera, Car } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDriverStatus, uploadCarPhoto } from "@/lib/api/profile";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
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
          const ext = blob.type === "image/png" ? "car.png" : "car.jpg";
          resolve(new File([blob], ext, { type: blob.type }));
        },
        "image/jpeg",
        0.88,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function CarPhotoUploader() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    staleTime: 60_000,
  });

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (file: File) => {
      const compressed = await compressImage(file);
      return uploadCarPhoto(compressed);
    },
    onSuccess: (result) => {
      setPreview(result.carPhotoUrl);
      void queryClient.invalidateQueries({ queryKey: ["driver-status"] });
    },
    onError: () => {
      setPreview(null);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    mutate(file);
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size={20} />
      </div>
    );
  }

  if (!status || status.status !== "verified" || !status.car) return null;

  const { car } = status;
  const currentPhotoUrl = preview ?? car.photoUrl;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className={cn(
            "group relative h-32 w-48 overflow-hidden rounded-2xl ring-2 ring-teal-500/30 transition hover:ring-teal-500",
            isPending && "opacity-70",
          )}
          aria-label="Загрузить фото автомобиля"
        >
          {currentPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentPhotoUrl}
              alt="Фото автомобиля"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <Car className="h-10 w-10 text-gray-400" aria-hidden="true" />
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
        {isSuccess && !isPending && (
          <p className="text-[11px] font-semibold text-teal-700">Фото обновлено</p>
        )}
        {error && (
          <p className="text-[11px] font-semibold text-coral-600">Ошибка загрузки. Попробуйте снова.</p>
        )}
      </div>

      {/* Read-only car info from tech passport */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-bold uppercase tracking-wide text-gray-400">Данные из техпаспорта</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            { label: "Марка", value: car.make },
            { label: "Модель", value: car.model },
            { label: "Год", value: String(car.year) },
            { label: "Цвет", value: car.color },
            { label: "Госномер", value: car.plate },
            { label: "Мест", value: String(car.seats) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="text-[14px] font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] font-semibold text-gray-400">
          Данные автомобиля изменяются только через повторную верификацию.
        </p>
      </div>
    </div>
  );
}
