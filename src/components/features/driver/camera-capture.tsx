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

// One big horizontal document window: a wide rounded frame with four L-shaped
// corner brackets (document-scanner style). No inner clutter — the whole
// document must stay visible.
function FrameGuide() {
  const line = "rgba(255,255,255,0.95)";
  const CORNERS = [
    { top: -1, left: -1, borderTop: `3px solid ${line}`, borderLeft: `3px solid ${line}`, borderTopLeftRadius: 22 },
    { top: -1, right: -1, borderTop: `3px solid ${line}`, borderRight: `3px solid ${line}`, borderTopRightRadius: 22 },
    { bottom: -1, left: -1, borderBottom: `3px solid ${line}`, borderLeft: `3px solid ${line}`, borderBottomLeftRadius: 22 },
    { bottom: -1, right: -1, borderBottom: `3px solid ${line}`, borderRight: `3px solid ${line}`, borderBottomRightRadius: 22 },
  ] as const;
  return (
    <div
      className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
      style={{ ...DIM, width: "96%", maxWidth: 760, aspectRatio: "3 / 2", borderRadius: 22, border: "1.5px solid rgba(255,255,255,0.35)" }}
    >
      {CORNERS.map((c, i) => (
        <span key={i} className="absolute" style={{ width: 34, height: 34, ...c }} />
      ))}
    </div>
  );
}

// Car-front silhouette guide (roof on the left, rounded nose on the right, two
// side-mirror tabs). Full-screen SVG: the evenodd path dims everything OUTSIDE
// the car; the second path strokes the outline. Scales to fit any screen.
const CAR_PATH =
  "M66,152 L168,152 L174,88 Q174,78 186,78 L210,78 Q222,78 224,90 L230,152 C276,156 300,232 300,320 C300,408 276,484 230,488 L224,550 Q222,562 210,562 L186,562 Q174,562 174,552 L168,488 L66,488 Q38,488 38,460 L38,180 Q38,152 66,152 Z";
function CarGuide() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 640" preserveAspectRatio="xMidYMid meet">
      <path d={`M-320,-320 H960 V960 H-320 Z ${CAR_PATH}`} fillRule="evenodd" fill="rgba(0,0,0,0.42)" />
      <path d={CAR_PATH} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

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
            {kind === "selfie" ? (
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
            ) : kind === "car" ? (
              // Car → a car-front silhouette contour (not a document frame).
              <>
                <CarGuide />
                <p className={HINT_TOP}>{t("car_hint")}</p>
              </>
            ) : (
              // Documents → one big HORIZONTAL scanner window so the whole
              // document stays visible (corner brackets, no inner clutter).
              <>
                <FrameGuide />
                <p className={HINT_TOP}>{t(kind === "passport" ? "passport_hint" : "doc_hint")}</p>
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
