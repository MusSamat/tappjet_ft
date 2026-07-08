"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Car,
  CheckCircle,
  Image as ImageIcon,
  Lock,
  Phone,
  Send,
  Users,
} from "lucide-react";
import { api, extractError } from "@/lib/api/client";
import { getDriverStatus } from "@/lib/api/profile";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { compressImage, ImageValidationError } from "@/lib/utils/compress-image";
import { isPlateValid, normalizePlate } from "@/lib/utils/plate";
import { useAuth } from "@/store/auth";
import { Button, Label, NotifCard, Spinner } from "@/components/ui";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";
import { SubmittedScreen } from "./_components/submitted-screen";
import { ReuploadDocs } from "./_components/reupload-docs";
import { CameraCapture } from "@/components/features/driver/camera-capture";

type DocKey = "license" | "license_back" | "car_passport" | "car_passport_back" | "car_photo" | "selfie";

const TOTAL_STEPS = 7;
const OTHER_MAKE = "__other__";

// Makes actually common on KG roads; datalist allows anything else typed in.
const CAR_MAKES = [
  "Toyota", "Honda", "Lexus", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Suzuki",
  "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Opel", "Porsche",
  "Hyundai", "Kia", "Daewoo", "Chevrolet", "Ford",
  "Lada (ВАЗ)", "ГАЗ", "УАЗ",
  "Renault", "Peugeot", "Skoda", "Fiat",
  "Geely", "Chery", "Haval", "Changan", "Lifan", "BYD",
];
// Steps 2..5 map to one document each (TZ §9.1 — separate screen per photo).
const PHOTO_STEPS: { step: number; key: DocKey; icon: React.ElementType }[] = [
  { step: 2, key: "license", icon: Briefcase },
  { step: 3, key: "license_back", icon: Briefcase },
  { step: 4, key: "car_passport", icon: Car },
  { step: 5, key: "car_passport_back", icon: Car },
  { step: 6, key: "car_photo", icon: ImageIcon },
  { step: 7, key: "selfie", icon: Camera },
];

export default function DriverVerifyPage() {
  const t = useTranslations("driver_reg");
  const fe = useFriendlyError();
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAuth((s) => s.status);
  const phoneVerified = useAuth((s) => s.user?.phoneVerified ?? false);
  const [showAddPhone, setShowAddPhone] = useState(false);

  const { data: driverStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    staleTime: 30_000,
  });

  const [step, setStep] = useState(1);
  const emptyDocs = {
    license: null,
    license_back: null,
    car_passport: null,
    car_passport_back: null,
    car_photo: null,
    selfie: null,
  };
  const [docs, setDocs] = useState<Record<DocKey, File | null>>({ ...emptyDocs });
  const [previews, setPreviews] = useState<Record<DocKey, string | null>>({ ...emptyDocs });
  const [docError, setDocError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Turn the backend's structured validation payload into per-field, human
  // messages instead of the old generic «проверьте правильность данных».
  const FIELD_LABELS: Record<string, string> = {
    carPlate: t("err_carPlate"),
    carYear: t("err_carYear"),
    carMake: t("err_carMake"),
    carModel: t("err_carModel"),
    carColor: t("err_carColor"),
    seatsCount: t("err_seatsCount"),
  };
  function explainError(e: unknown): void {
    const err = extractError(e) as {
      code?: string;
      message?: string;
      details?: { issues?: { path: string }[]; reason?: string; field?: string };
    };
    setFieldErrors({});
    if (err.code === "VALIDATION_ERROR") {
      const issues = err.details?.issues;
      if (Array.isArray(issues) && issues.length > 0) {
        const fe2: Record<string, string> = {};
        for (const i of issues) {
          const label = FIELD_LABELS[i.path];
          if (label) fe2[i.path] = label;
        }
        setFieldErrors(fe2);
        setServerError(t("fix_marked_fields"));
        setStep(1); // car-data fields live on step 1 — bring the user to them
        return;
      }
      if (err.details?.reason === "missing_file" || err.details?.reason === "missing_files") {
        const field = err.details?.field;
        setServerError(
          field ? t("err_missing_photo", { doc: t(`doc_${field}_label`) }) : t("err_missing_photos"),
        );
        const stepFor = PHOTO_STEPS.find((ps) => ps.key === field)?.step;
        if (stepFor) setStep(stepFor);
        return;
      }
      // Upload-layer reasons (image checks, size limits) — all mapped to
      // human text; the raw reason is appended so support can identify cases.
      const PHOTO_REASONS: Record<string, string> = {
        image_too_small: t("err_photo_small"),
        unreadable_image_dimensions: t("err_photo_unreadable"),
        unsupported_mime: t("err_photo_type"),
        bad_magic_bytes: t("err_photo_type"),
        mime_mismatch: t("err_photo_type"),
        file_too_large: t("err_photo_large"),
        upload_rejected: t("err_photo_unreadable"),
      };
      const reason = err.details?.reason;
      const photoMsg = reason ? PHOTO_REASONS[reason] : undefined;
      if (photoMsg) {
        const field = err.details?.field;
        const stepFor = PHOTO_STEPS.find((ps) => ps.key === field)?.step;
        setServerError(field ? `${t(`doc_${field}_label`)}: ${photoMsg}` : photoMsg);
        if (stepFor) setStep(stepFor);
        return;
      }
    }
    // Conflicts (номер занят, заявка уже в работе) carry a human server message.
    if (err.code === "CONFLICT" && err.message) {
      setServerError(err.message);
      return;
    }
    const raw = extractError(e) as { code?: string; details?: { reason?: string } };
    const trail = raw.details?.reason ?? raw.code;
    setServerError(`${fe(extractError(e))}${trail ? ` (${trail})` : ""}`);
  }
  const galleryRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const [carMake, setCarMake] = useState("");
  const [makeOther, setMakeOther] = useState(false);
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  // Единый стандарт номера — общий с гаражом (lib/utils/plate).
  const plateValid = isPlateValid(plate);
  const onPlateChange = (raw: string) => setPlate(normalizePlate(raw));
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
      return api.post("/drivers/verification", fd);
    },
    onSuccess: () => {
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["driver-status"] });
    },
    onError: (e) => explainError(e),
  });

  const canCarData =
    carMake.trim() && carModel.trim() && year && color.trim() && plateValid && seats;

  const currentDoc = PHOTO_STEPS.find((p) => p.step === step);

  async function acceptPhoto(key: DocKey, file: File) {
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

  // Phone gate — driver verification needs a confirmed number so passengers can
  // reach the driver. Block the wizard up front instead of failing on submit.
  if (authStatus === "authenticated" && !phoneVerified) {
    return (
      <>
        <div className="mx-auto flex min-h-[60vh] max-w-[480px] flex-col items-center justify-center px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-500/10">
            <Phone className="h-7 w-7 text-brand-600" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[20px] font-900 text-ink-900 dark:text-white">{t("gate_phone_title")}</h1>
          <p className="mt-2 text-[15px] font-600 leading-relaxed text-ink-500">{t("gate_phone_text")}</p>
          <Button variant="brand" size="lg" className="mt-5 w-full max-w-[320px]" onClick={() => setShowAddPhone(true)}>
            {t("gate_phone_cta")}
          </Button>
        </div>
        <AddPhoneModal open={showAddPhone} onClose={() => setShowAddPhone(false)} onDone={() => setShowAddPhone(false)} />
      </>
    );
  }

  if (statusLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }
  // Status-aware entry: never show a blank wizard to someone whose
  // application is already in flight — that used to end in a confusing 409.
  if (driverStatus && driverStatus.status === "pending") return <SubmittedScreen />;
  if (driverStatus && driverStatus.status === "verified") {
    return (
      <div className="mx-auto max-w-[480px] p-6 pt-16 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-brand-500" aria-hidden="true" />
        <h1 className="mt-4 text-[20px] font-900 text-ink-900 dark:text-white">{t("already_verified_title")}</h1>
        <p className="mt-2 text-[15px] font-600 text-ink-500">{t("already_verified_desc")}</p>
        {/* Not a dead end: verified drivers came here to «switch into driver» —
            give them exactly that, landing on the driver-mode search. */}
        <Button
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => router.push("/")}
        >
          {t("switch_to_driver")}
        </Button>
        <Button variant="ghost" size="md" className="mt-2" onClick={() => router.push("/profile")}>
          {t("back_to_profile")}
        </Button>
      </div>
    );
  }
  if (driverStatus && driverStatus.status === "docs_requested") {
    return <ReuploadDocs requestedDocs={driverStatus.requestedDocs} onDone={() => {
      void queryClient.invalidateQueries({ queryKey: ["driver-status"] });
    }} />;
  }
  // rejected → show the reason banner above a fresh wizard (resubmission allowed)

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1 text-[14px] font-bold text-ink-600 hover:text-ink-900"
      >
        {t("back")}
      </button>

      {driverStatus?.status === "rejected" && (
        <div className="mb-4 rounded-2xl bg-coral-50 px-4 py-3 text-[15px] font-700 text-coral-700 dark:bg-coral-500/10 dark:text-coral-300">
          {t("rejected_banner", { reason: driverStatus.rejectionReason ?? "—" })}
        </div>
      )}

      <h1 className="text-[26px] font-extrabold text-ink-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-[15px] font-semibold text-ink-500">{t("step", { step })}</p>

      <div className="mb-6 mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
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
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm dark:bg-ink-900 dark:border-ink-800">
            <h2 className="mb-4 text-[17px] font-extrabold text-ink-900 dark:text-white">{t("car_section")}</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="car-make">{t("make_label")}</Label>
                  {/* Native select works in every WebView (datalist does not in
                      Telegram). "Other make" reveals free-text entry. */}
                  <select
                    id="car-make"
                    value={makeOther ? OTHER_MAKE : carMake}
                    onChange={(e) => {
                      if (e.target.value === OTHER_MAKE) {
                        setMakeOther(true);
                        setCarMake("");
                      } else {
                        setMakeOther(false);
                        setCarMake(e.target.value);
                      }
                    }}
                    className="mt-1 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  >
                    {/* NOT disabled: a disabled empty option makes mobile/Telegram
                        WebViews display the first real option (Toyota) while the
                        value stays "" — looked selected but failed validation. */}
                    <option value="">{t("make_placeholder")}</option>
                    {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                    <option value={OTHER_MAKE}>{t("make_other")}</option>
                  </select>
                  {makeOther && (
                    <input
                      type="text"
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      placeholder={t("make_other_placeholder")}
                      className="mt-2 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                    />
                  )}
                  {fieldErrors.carMake && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.carMake}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="car-model">{t("model_label")}</Label>
                  <input
                    id="car-model"
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder={t("model_placeholder")}
                    className="mt-1 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  />
                  {fieldErrors.carModel && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.carModel}</p>
                  )}
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
                    className="mt-1 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  />
                  {fieldErrors.carYear && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.carYear}</p>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="car-color">{t("color_label")}</Label>
                  <input
                    id="car-color"
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder={t("color_placeholder")}
                    className="mt-1 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  />
                  {fieldErrors.carColor && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.carColor}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="car-plate">{t("plate_label")}</Label>
                  <input
                    id="car-plate"
                    type="text"
                    value={plate}
                    onChange={(e) => onPlateChange(e.target.value)}
                    placeholder="01KG123ABC"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={10}
                    inputMode="text"
                    className={`mt-1 w-full rounded-2xl border-2 bg-ink-50 px-3 py-2.5 text-[15px] font-800 uppercase tracking-widest text-ink-900 outline-none focus:border-brand-500 dark:bg-ink-900 dark:text-white ${plate && !plateValid ? "border-coral-400" : "border-ink-200 dark:border-ink-700"}`}
                  />
                  {plate && !plateValid && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">
                      {t("plate_format_hint")}
                    </p>
                  )}
                  {fieldErrors.carPlate && plateValid && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.carPlate}</p>
                  )}
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
                    min={1}
                    max={7}
                    className="mt-1 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
                  />
                  {fieldErrors.seatsCount && (
                    <p className="mt-1 text-[13px] font-700 text-coral-500">{fieldErrors.seatsCount}</p>
                  )}
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
          <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm dark:bg-ink-900 dark:border-ink-800">
            <div className="mb-1 flex items-center gap-2">
              <currentDoc.icon className="h-[18px] w-[18px] text-brand-700" aria-hidden="true" />
              <h2 className="text-[17px] font-extrabold text-ink-900 dark:text-white">
                {t(`doc_${currentDoc.key}_label`)}
              </h2>
            </div>
            <p className="mb-4 text-[15px] font-semibold text-ink-500">
              {t(`doc_${currentDoc.key}_desc`)}
            </p>

            {/* Hybrid rule: documents may come from the gallery (many drivers
                keep good scans), but the SELFIE is live-camera only — it is
                the anti-fraud anchor the moderator matches the license photo
                against. A gallery selfie would defeat the whole check. */}
            {cameraOpen && (
              <CameraCapture
                kind={
                  currentDoc.key === "selfie"
                    ? "selfie"
                    : currentDoc.key === "car_photo"
                      ? "car"
                      : "document"
                }
                onClose={() => setCameraOpen(false)}
                onCapture={(file) => {
                  setCameraOpen(false);
                  void acceptPhoto(currentDoc.key, file);
                }}
              />
            )}

            {currentDoc.key !== "selfie" && (
              <input
                ref={galleryRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void acceptPhoto(currentDoc.key, f);
                }}
              />
            )}

            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              disabled={compressing}
              className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 hover:border-brand-400 dark:bg-ink-900 dark:border-ink-700"
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
                <div className="flex flex-col items-center gap-2 text-ink-400">
                  <Camera className="h-8 w-8" aria-hidden="true" />
                  <span className="text-[13px] font-bold">{t("upload_btn")}</span>
                </div>
              )}
            </button>

            {currentDoc.key !== "selfie" ? (
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={compressing}
                className="mt-2 text-[13px] font-800 text-brand-600 underline disabled:opacity-50"
              >
                {t("from_gallery")}
              </button>
            ) : (
              <p className="mt-2 text-[13px] font-semibold text-ink-400">{t("selfie_live_only")}</p>
            )}

            <p className="mt-2 text-[13px] font-semibold text-ink-400">{t("photo_hint")}</p>
            {docs[currentDoc.key] && !docError && (
              <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-brand-700">
                <CheckCircle className="h-3.5 w-3.5" /> {t("change_btn")}
              </p>
            )}
            {docError && <p className="mt-2 text-[13px] font-bold text-coral-600">{docError}</p>}
          </div>

          {currentDoc.key === "selfie" && (
            <div className="mt-4 rounded-2xl bg-ink-50 px-4 py-3 dark:bg-ink-800">
              <div className="mb-1 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-ink-600" aria-hidden="true" />
                <span className="text-[14px] font-bold text-ink-900 dark:text-white">{t("privacy_note")}</span>
              </div>
              <p className="text-[14px] font-semibold text-ink-500">{t("privacy_desc")}</p>
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
          {/* Consent: a verified driver's phone is shown to logged-in users
              via «Позвонить» on their trips. */}
          <p className="mt-3 text-center text-[13px] font-600 text-ink-400">{t("consent_phone")}</p>
        </>
      )}
    </div>
  );
}
