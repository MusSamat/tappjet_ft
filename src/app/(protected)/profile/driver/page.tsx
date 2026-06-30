"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Car,
  CheckCircle,
  Image as ImageIcon,
  Lock,
  Send,
  Users,
} from "lucide-react";
import { api, extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { compressImage, ImageValidationError } from "@/lib/utils/compress-image";
import { Button, Label, NotifCard, Spinner } from "@/components/ui";
import { SubmittedScreen } from "./_components/submitted-screen";

type DocKey = "license" | "car_passport" | "car_photo" | "selfie";

const TOTAL_STEPS = 5;
// Steps 2..5 map to one document each (TZ §9.1 — separate screen per photo).
const PHOTO_STEPS: { step: number; key: DocKey; icon: React.ElementType }[] = [
  { step: 2, key: "license", icon: Briefcase },
  { step: 3, key: "car_passport", icon: Car },
  { step: 4, key: "car_photo", icon: ImageIcon },
  { step: 5, key: "selfie", icon: Camera },
];

export default function DriverVerifyPage() {
  const t = useTranslations("driver_reg");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [docs, setDocs] = useState<Record<DocKey, File | null>>({
    license: null,
    car_passport: null,
    car_photo: null,
    selfie: null,
  });
  const [previews, setPreviews] = useState<Record<DocKey, string | null>>({
    license: null,
    car_passport: null,
    car_photo: null,
    selfie: null,
  });
  const [docError, setDocError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

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

  const canCarData =
    carMake.trim() && carModel.trim() && year && color.trim() && plate.trim() && seats;

  const currentDoc = PHOTO_STEPS.find((p) => p.step === step);

  async function handleFile(key: DocKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setDocError(null);
    setCompressing(true);
    try {
      // Compress + validate min 800×600 / ≤5MB on the client before upload.
      const compressed = await compressImage(file, { maxMB: 5, minWidth: 800, minHeight: 600 });
      setDocs((d) => ({ ...d, [key]: compressed }));
      setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(compressed) }));
    } catch (err) {
      const reason = err instanceof ImageValidationError ? err.reason : "decode_failed";
      setDocError(reason === "too_small" ? t("photo_too_small") : t("photo_error"));
      setDocs((d) => ({ ...d, [key]: null }));
      setPreviews((p) => ({ ...p, [key]: null }));
    } finally {
      setCompressing(false);
    }
  }

  function goBack() {
    setDocError(null);
    if (step > 1) setStep((s) => s - 1);
    else router.back();
  }

  if (submitted) return <SubmittedScreen />;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:text-gray-900"
      >
        {t("back")}
      </button>

      <h1 className="text-[26px] font-extrabold text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-[13px] font-semibold text-gray-500">{t("step", { step })}</p>

      <div className="mb-6 mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-teal-600 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {serverError && (
        <div className="mb-4">
          <NotifCard variant="error" title={t("error_title")}>
            {serverError}
          </NotifCard>
        </div>
      )}

      {/* Step 1 — car data */}
      {step === 1 && (
        <>
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[16px] font-extrabold text-gray-900">{t("car_section")}</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="car-make">{t("make_label")}</Label>
                  <input
                    id="car-make"
                    type="text"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    placeholder={t("make_placeholder")}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="car-model">{t("model_label")}</Label>
                  <input
                    id="car-model"
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder={t("model_placeholder")}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="car-year">{t("year_label")}</Label>
                  <input
                    id="car-year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder={t("year_placeholder")}
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="car-color">{t("color_label")}</Label>
                  <input
                    id="car-color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder={t("color_placeholder")}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="car-plate">{t("plate_label")}</Label>
                  <input
                    id="car-plate"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder={t("plate_placeholder")}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="w-[120px]">
                  <Label htmlFor="seats-count">
                    <Users className="inline h-3 w-3" /> {t("seats_label")}
                  </Label>
                  <input
                    id="seats-count"
                    type="number"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="4"
                    min={1}
                    max={7}
                    className="mt-1 w-full rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] font-semibold text-gray-900 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="submit"
            size="lg"
            className="mt-5 w-full"
            disabled={!canCarData}
            onClick={() => setStep(2)}
          >
            {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </>
      )}

      {/* Steps 2..5 — one document photo each */}
      {currentDoc && (
        <>
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <currentDoc.icon className="h-[18px] w-[18px] text-teal-700" aria-hidden="true" />
              <h2 className="text-[16px] font-extrabold text-gray-900">
                {t(`doc_${currentDoc.key}_label`)}
              </h2>
            </div>
            <p className="mb-4 text-[13px] font-semibold text-gray-500">
              {t(`doc_${currentDoc.key}_desc`)}
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFile(currentDoc.key, e)}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={compressing}
              className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-teal-400"
            >
              {compressing ? (
                <Spinner size={24} />
              ) : previews[currentDoc.key] ? (
                <img
                  src={previews[currentDoc.key] as string}
                  alt={t(`doc_${currentDoc.key}_label`)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Camera className="h-8 w-8" aria-hidden="true" />
                  <span className="text-[12px] font-bold">{t("upload_btn")}</span>
                </div>
              )}
            </button>

            <p className="mt-2 text-[11px] font-semibold text-gray-400">{t("photo_hint")}</p>
            {docs[currentDoc.key] && !docError && (
              <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-teal-700">
                <CheckCircle className="h-3.5 w-3.5" /> {t("change_btn")}
              </p>
            )}
            {docError && <p className="mt-2 text-[12px] font-bold text-coral-600">{docError}</p>}
          </div>

          {currentDoc.key === "selfie" && (
            <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-gray-600" aria-hidden="true" />
                <span className="text-[13px] font-bold text-gray-900">{t("privacy_note")}</span>
              </div>
              <p className="text-[12px] font-semibold text-gray-500">{t("privacy_desc")}</p>
            </div>
          )}

          {step < TOTAL_STEPS ? (
            <Button
              variant="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={!docs[currentDoc.key] || compressing}
              onClick={() => {
                setDocError(null);
                setStep((s) => s + 1);
              }}
            >
              {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={!docs.selfie || compressing || mutation.isPending}
              onClick={() => {
                setServerError(null);
                mutation.mutate();
              }}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {mutation.isPending ? t("submitting") : t("submit_btn")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
