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

export type CaptureKind = "document" | "selfie" | "car";

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
        <input
          ref={fallbackRef}
          type="file"
          accept="image/jpeg,image/png"
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

        {/* Guide overlay — only over the live view */}
        {!shot && ready && (
          <div className="pointer-events-none absolute inset-0">
            {kind === "selfie" ? (
              <>
                {/* Face-ID style: dimmed screen with a transparent oval window */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 34% 42% at 50% 44%, transparent 98%, black 100%)",
                    maskImage:
                      "radial-gradient(ellipse 34% 42% at 50% 44%, transparent 98%, black 100%)",
                  }}
                />
                <div
                  className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-white/90"
                  style={{ width: "68vw", maxWidth: 340, aspectRatio: "3/4" }}
                />
                <p className="absolute inset-x-6 top-[8%] text-center text-[15px] font-800 text-white drop-shadow">
                  {t("selfie_hint")}
                </p>
              </>
            ) : kind === "car" ? (
              <>
                {/* Car front-view контур: dimmed edges + schematic outline the
                    driver aligns the car into (Face-ID style, but a car). */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    WebkitMaskImage:
                      "linear-gradient(black, black), linear-gradient(black, black)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    WebkitMaskSize: "100% 100%, 92% 52%",
                    maskSize: "100% 100%, 92% 52%",
                    WebkitMaskPosition: "0 0, 50% 46%",
                    maskPosition: "0 0, 50% 46%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
                <svg
                  viewBox="0 0 200 110"
                  className="absolute left-1/2 top-[46%] w-[88%] -translate-x-1/2 -translate-y-1/2 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {/* cabin / roof — wide, low dome */}
                  <path d="M60 52 Q66 30 100 30 Q134 30 140 52" />
                  {/* body shell */}
                  <path d="M34 84 L34 66 Q34 57 50 54 L150 54 Q166 57 166 66 L166 84 Z" />
                  {/* hood character line */}
                  <path d="M42 66 L158 66" />
                  {/* headlights */}
                  <path d="M42 62 Q50 59 58 62" />
                  <path d="M142 62 Q150 59 158 62" />
                  {/* side mirrors */}
                  <path d="M34 60 L24 56" />
                  <path d="M166 60 L176 56" />
                  {/* tyres peeking below */}
                  <path d="M48 84 Q48 93 60 93 Q72 93 72 84" />
                  <path d="M128 84 Q128 93 140 93 Q152 93 152 84" />
                </svg>
                <p className="absolute inset-x-6 top-[8%] text-center text-[15px] font-800 text-white drop-shadow">
                  {t("car_hint")}
                </p>
              </>
            ) : (
              <>
                {/* Document frame: dimmed edges, transparent rounded-rect window */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    WebkitMaskImage:
                      "linear-gradient(black, black), linear-gradient(black, black)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    WebkitMaskSize: "100% 100%, 88% 46%",
                    maskSize: "100% 100%, 88% 46%",
                    WebkitMaskPosition: "0 0, 50% 42%",
                    maskPosition: "0 0, 50% 42%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
                <div
                  className="absolute left-1/2 top-[42%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-white/90"
                  style={{ aspectRatio: "1.586" }}
                />
                <p className="absolute inset-x-6 top-[10%] text-center text-[15px] font-800 text-white drop-shadow">
                  {t("doc_hint")}
                </p>
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
