"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Briefcase, Camera, Car, CheckCircle, Image, Lock, Send, Users } from "lucide-react";
import { api } from "@/lib/api/client";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { Button, Label, NotifCard } from "@/components/ui";
import { SubmittedScreen } from "./_components/submitted-screen";

type DocKey = "license" | "car_passport" | "car_photo" | "selfie";

export default function DriverVerifyPage() {
  const t = useTranslations("driver_reg");
  const router = useRouter();
  const fileInputRefs = useRef<Partial<Record<DocKey, HTMLInputElement | null>>>({});

  const DOCS: { key: DocKey; label: string; desc: string; icon: React.ElementType }[] = [
    { key: "license", label: t("doc_license_label"), desc: t("doc_license_desc"), icon: Briefcase },
    { key: "car_passport", label: t("doc_car_passport_label"), desc: t("doc_car_passport_desc"), icon: Car },
    { key: "car_photo", label: t("doc_car_photo_label"), desc: t("doc_car_photo_desc"), icon: Image },
    { key: "selfie", label: t("doc_selfie_label"), desc: t("doc_selfie_desc"), icon: Camera },
  ];

  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    license: null, car_passport: null, car_photo: null, selfie: null,
  });
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("carMake", carMake.trim());
      fd.append("carModel", carModel.trim());
      fd.append("carYear", year);
      fd.append("carColor", color.trim());
      fd.append("carPlate", plate.trim().toUpperCase());
      fd.append("seatsCount", seats);
      (Object.keys(docs) as DocKey[]).forEach((k) => {
        if (docs[k]) fd.append(k, docs[k] as File);
      });
      return api.post("/drivers/verification", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => setSubmitted(true),
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  const allDocs = DOCS.every(({ key }) => docs[key] !== null);
  const canSubmit =
    allDocs && carMake.trim() && carModel.trim() && year &&
    color.trim() && plate.trim() && seats && !mutation.isPending;

  function pickFile(key: DocKey) {
    fileInputRefs.current[key]?.click();
  }

  function handleFile(key: DocKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setDocs((d) => ({ ...d, [key]: file }));
    e.target.value = "";
  }

  if (submitted) return <SubmittedScreen />;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:text-gray-900"
      >
        {t("back")}
      </button>

      <h1 className="text-[26px] font-extrabold text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-[13px] font-semibold text-gray-500">{t("subtitle")}</p>

      {serverError && (
        <div className="mt-4">
          <NotifCard variant="error" title={t("error_title")}>{serverError}</NotifCard>
        </div>
      )}

      {/* Documents */}
      <div className="mt-5 rounded-[20px] border-[0.5px] border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-[16px] font-extrabold text-gray-900">{t("docs_section")}</h2>
        <div className="flex flex-col gap-3">
          {DOCS.map(({ key, label, desc, icon: Icon }) => {
            const file = docs[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-[14px] border border-gray-200 p-3"
              >
                <input
                  ref={(el) => { fileInputRefs.current[key] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(key, e)}
                />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-700">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-gray-900">{label}</p>
                    {file ? (
                      <p className="truncate text-[12px] font-semibold text-teal-700">{file.name}</p>
                    ) : (
                      <p className="text-[12px] font-semibold text-gray-500">{desc}</p>
                    )}
                  </div>
                </div>
                {file ? (
                  <button
                    type="button"
                    onClick={() => pickFile(key)}
                    className="ml-3 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700"
                  >
                    <CheckCircle className="h-3 w-3" /> {t("change_btn")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => pickFile(key)}
                    className="ml-3 flex-shrink-0 rounded-xl border border-gray-300 px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
                  >
                    {t("upload_btn")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Car info */}
      <div className="mt-4 rounded-[20px] border-[0.5px] border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-[16px] font-extrabold text-gray-900">{t("car_section")}</h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="car-make">{t("make_label")}</Label>
              <input id="car-make" type="text" value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder={t("make_placeholder")} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="car-model">{t("model_label")}</Label>
              <input id="car-model" type="text" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder={t("model_placeholder")} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="car-year">{t("year_label")}</Label>
              <input id="car-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={t("year_placeholder")} min={1980} max={new Date().getFullYear() + 1} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
            <div className="flex-1">
              <Label htmlFor="car-color">{t("color_label")}</Label>
              <input id="car-color" type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder={t("color_placeholder")} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="car-plate">{t("plate_label")}</Label>
              <input id="car-plate" type="text" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder={t("plate_placeholder")} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
            <div className="w-[120px]">
              <Label htmlFor="seats-count">
                <Users className="inline h-3 w-3" /> {t("seats_label")}
              </Label>
              <input id="seats-count" type="number" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="4" min={1} max={7} className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mt-4 rounded-[14px] bg-gray-50 px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 flex-shrink-0 text-gray-600" aria-hidden="true" />
          <span className="text-[13px] font-bold text-gray-900">{t("privacy_note")}</span>
        </div>
        <p className="text-[12px] font-semibold text-gray-500">{t("privacy_desc")}</p>
      </div>

      <Button
        variant="submit"
        size="lg"
        className="mt-5 w-full"
        disabled={!canSubmit}
        onClick={() => { setServerError(null); mutation.mutate(); }}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {mutation.isPending ? t("submitting") : t("submit_btn")}
      </Button>
    </div>
  );
}
