"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { submitComplaint, type ComplaintCategory } from "@/lib/api/complaints";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { Button, Label, Spinner, Textarea } from "@/components/ui";
import { ArrowLeft, Camera, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MAX_IMAGES = 5;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic";

const CATEGORY_KEYS = ["safety", "fraud", "behavior", "payment", "other"] as const;

type FormData = {
  category: ComplaintCategory;
  description: string;
};

interface PageProps {
  searchParams: Promise<{ user?: string; trip?: string }>;
}

export default function ComplaintPage({ searchParams }: PageProps) {
  const t = useTranslations("complaint");
  const params = use(searchParams);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: { value: ComplaintCategory; label: string }[] = CATEGORY_KEYS.map((k) => ({
    value: k,
    label: t(`categories.${k}`),
  }));

  const schema = z.object({
    category: z.enum(["safety", "fraud", "behavior", "payment", "other"]),
    description: z.string().min(20, t("description_min")).max(1000, t("description_max")),
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "behavior" },
  });

  const description = watch("description") ?? "";

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (data: FormData) =>
      submitComplaint(
        { ...data, targetUserId: params.user, targetTripId: params.trip },
        images.length > 0 ? images : undefined,
      ),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    setImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });

    // Reset input so same file can be re-selected if removed
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
  };

  const errorMessage = error ? friendlyError(extractError(error)) : null;

  if (isSuccess) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-teal-600" aria-hidden="true" />
        <h1 className="mt-4 text-[22px] font-extrabold text-gray-900">{t("success_title")}</h1>
        <p className="mt-2 text-[14px] text-gray-700">{t("success_hint")}</p>
        <Button variant="primary" size="md" className="mt-6" onClick={() => router.back()}>
          {t("back_btn")}
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back_btn")}
      </button>
      <h1 className="text-[22px] font-extrabold text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-[14px] text-gray-700">{t("subtitle")}</p>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="mt-6 space-y-5">
        {/* Category */}
        <div>
          <Label>{t("category_label")}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map(({ value, label }) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} {...register("category")} className="sr-only" />
                <span
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                    watch("category") === value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-300 text-gray-700 hover:border-teal-400",
                  )}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">{t("description_label")}</Label>
          <Textarea
            id="description"
            rows={5}
            maxLength={1000}
            placeholder={t("description_placeholder")}
            {...register("description")}
            className="mt-1"
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            {errors.description ? (
              <p className="text-[11px] font-semibold text-coral-600">{errors.description.message}</p>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-gray-500">{description.length}/1000</span>
          </div>
        </div>

        {/* Image attachments */}
        <div>
          <Label>{t("photos_label")}</Label>
          <p className="mb-3 mt-0.5 text-[12px] text-gray-500">
            {t("photos_hint", { n: MAX_IMAGES })}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={handleFileChange}
            aria-label={t("select_photos_label")}
          />

          <div className="flex flex-wrap gap-3">
            {/* Previews */}
            {previews.map((src, idx) => (
              <div key={idx} className="relative h-20 w-20 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={t("photo_alt", { n: idx + 1 })}
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-coral-600"
                  aria-label={t("remove_photo_label", { n: idx + 1 })}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-500 transition-colors"
                aria-label={t("add_photo_aria")}
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-bold">
                  {images.length > 0 ? `${images.length}/${MAX_IMAGES}` : t("add_btn")}
                </span>
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <p className="text-[12px] font-semibold text-coral-600">{errorMessage}</p>
        )}

        <Button type="submit" variant="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? <Spinner size={18} /> : t("submit_btn")}
        </Button>
      </form>
    </div>
  );
}
