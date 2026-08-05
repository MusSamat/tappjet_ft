"use client";

// Live camera capture for driver verification (TZ: документы снимаются камерой,
// загрузка из галереи закрыта — фото должно быть «живым»).
// - documents → back camera + rounded-rect frame guide
// - selfie    → front camera + oval "face here" mask (Face-ID style)
// getUserMedia unavailable (old WebView, denied permission) → graceful fallback
// to <input capture>, which still opens the camera and not the gallery.

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, RefreshCw, Check, X } from "lucide-react";
import { Button, Spinner } from "@/components/ui";

export type CaptureKind = "document" | "selfie" | "car" | "passport";

// Dims everything OUTSIDE the guide window while following its rounded/oval
// corners (cleaner than a CSS mask). Shared by every guide shape.
const DIM = { boxShadow: "0 0 0 100vmax rgba(0,0,0,0.42)" } as const;
const HINT_TOP = "absolute inset-x-6 top-[8%] text-center text-[15px] font-800 text-white drop-shadow";

interface Props {
  kind: CaptureKind;
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ kind, onCapture, onClose }: Props) {
  const t = useTranslations("camera");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const shotBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: kind === "selfie" ? "user" : "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [kind]);

  const takeShot = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Selfie preview is mirrored for the user; un-mirror the actual shot.
    if (kind === "selfie") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        shotBlobRef.current = blob;
        setShot(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92,
    );
  }, [kind]);

  const confirm = () => {
    const blob = shotBlobRef.current;
    if (!blob) return;
    onCapture(new File([blob], `${kind}-${Date.now()}.jpg`, { type: "image/jpeg" }));
  };

  const retake = () => {
    if (shot) URL.revokeObjectURL(shot);
    shotBlobRef.current = null;
    setShot(null);
  };

  // Fallback: camera-only file input (capture attr blocks the gallery on mobile).
  if (failed) {
    return (
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4 bg-black/90 p-6 text-center">
        <p className="text-[15px] font-700 text-white">{t("no_camera")}</p>
        {/* accept="image/*" (not specific mimes) is required for many mobile
            WebViews — incl. Telegram — to honour `capture` and open the CAMERA
            instead of the Files/gallery chooser. */}
        <input
          ref={fallbackRef}
          type="file"
          accept="image/*"
          capture={kind === "selfie" ? "user" : "environment"}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onCapture(f);
          }}
        />
        <Button variant="primary" size="md" onClick={() => fallbackRef.current?.click()}>
          {t("open_camera")}
        </Button>
        <button type="button" onClick={onClose} className="text-[15px] font-700 text-white/70">
          {t("cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black">
      {/* Live view / shot preview */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} alt="" className="h-full w-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
            style={kind === "selfie" ? { transform: "scaleX(-1)" } : undefined}
          />
        )}

        {/* Guide overlay — clean, spec-driven contours over the live view. The
            `box-shadow: 0 0 0 100vmax` dims everything OUTSIDE the window while
            respecting its rounded/oval corners (no CSS-mask corner artefacts). */}
        {!shot && ready && (
          <div className="pointer-events-none absolute inset-0">
            {kind === "selfie" && (
              <>
                <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" style={{ ...DIM, width: "clamp(180px, 62vw, 300px)", aspectRatio: "1 / 1.2", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.95)" }}>
                  {/* brow + eye alignment guides (thin grey) */}
                  <div className="absolute left-[16%] right-[16%]" style={{ top: "38%", height: 1, background: "rgba(200,200,200,0.5)" }} />
                  <div className="absolute left-[10%] right-[10%]" style={{ top: "48%", height: 1, background: "rgba(200,200,200,0.75)" }} />
                  {/* side markers */}
                  <div className="absolute top-1/2 -translate-y-1/2" style={{ left: -3, width: 9, height: 2, background: "rgba(255,255,255,0.85)" }} />
                  <div className="absolute top-1/2 -translate-y-1/2" style={{ right: -3, width: 9, height: 2, background: "rgba(255,255,255,0.85)" }} />
                </div>
                <p className={HINT_TOP}>{t("selfie_hint")}</p>
              </>
            )}

            {kind === "car" && (
              <>
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2" style={{ ...DIM, width: "80%", maxWidth: 520, aspectRatio: "16 / 10", borderRadius: 18, border: "2.5px solid rgba(255,255,255,0.95)" }}>
                  {/* amber plate zone line + hint */}
                  <div className="absolute left-[16%] right-[16%]" style={{ bottom: "16%", height: 2, borderRadius: 2, background: "rgba(245,158,11,0.95)" }} />
                  <p className="absolute left-0 right-0 text-center" style={{ bottom: "5%", fontSize: 11, fontWeight: 700, color: "rgba(245,158,11,0.95)" }}>{t("car_plate_hint")}</p>
                  {/* bottom corner markers (triangles) */}
                  <span className="absolute" style={{ left: 7, bottom: 7, width: 0, height: 0, borderLeft: "9px solid transparent", borderBottom: "9px solid rgba(255,255,255,0.9)" }} />
                  <span className="absolute" style={{ right: 7, bottom: 7, width: 0, height: 0, borderRight: "9px solid transparent", borderBottom: "9px solid rgba(255,255,255,0.9)" }} />
                </div>
                <p className={HINT_TOP}>{t("car_hint")}</p>
              </>
            )}

            {kind === "passport" && (
              <>
                {/* Tech passport — CYAN horizontal frame + 3 dashed field lines */}
                <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2" style={{ ...DIM, width: "75%", maxWidth: 480, aspectRatio: "1.6", borderRadius: 8, border: "2.5px solid rgba(0,150,180,0.95)" }}>
                  {[30, 60, 85].map((top) => (
                    <div key={top} className="absolute left-[8%] right-[8%]" style={{ top: `${top}%`, borderTop: "2px dashed rgba(0,150,180,0.85)" }} />
                  ))}
                </div>
                <p className={HINT_TOP}>{t("passport_hint")}</p>
              </>
            )}

            {kind === "document" && (
              <>
                {/* ID card — white frame, corner dots, face zone (green), text zone */}
                <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" style={{ ...DIM, width: "78%", maxWidth: 460, aspectRatio: "1.586", borderRadius: 8, border: "2.5px solid rgba(255,255,255,0.95)" }}>
                  {/* four corner dots */}
                  <span className="absolute rounded-full bg-white" style={{ width: 5, height: 5, left: "5%", top: "8%" }} />
                  <span className="absolute rounded-full bg-white" style={{ width: 5, height: 5, right: "5%", top: "8%" }} />
                  <span className="absolute rounded-full bg-white" style={{ width: 5, height: 5, left: "5%", bottom: "8%" }} />
                  <span className="absolute rounded-full bg-white" style={{ width: 5, height: 5, right: "5%", bottom: "8%" }} />
                  {/* face zone (photo on a KG ID sits on the left) */}
                  <div className="absolute" style={{ left: "8%", top: "20%", width: "24%", aspectRatio: "0.8", borderRadius: "50%", border: "2px solid rgba(76,175,80,0.9)" }} />
                  {/* text zone line */}
                  <div className="absolute left-[38%] right-[8%]" style={{ bottom: "26%", borderTop: "1.5px dashed rgba(255,255,255,0.6)" }} />
                </div>
                <p className={HINT_TOP}>{t("doc_hint")}</p>
              </>
            )}
          </div>
        )}

        {!ready && !shot && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={28} className="text-white" />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={t("cancel")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center justify-center gap-8 py-6 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {shot ? (
          <>
            <button
              type="button"
              onClick={retake}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white"
              aria-label={t("retake")}
            >
              <RefreshCw className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={confirm}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lift"
              aria-label={t("use_photo")}
            >
              <Check className="h-7 w-7" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!ready}
            onClick={takeShot}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white disabled:opacity-40"
            aria-label={t("shoot")}
          >
            <Camera className="h-7 w-7" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
