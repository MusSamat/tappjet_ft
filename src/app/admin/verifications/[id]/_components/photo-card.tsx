"use client";

import { useState } from "react";
import { ExternalLink, ZoomIn, ZoomOut, RotateCw, X } from "lucide-react";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

export function PhotoCard({ label, src }: { label: string; src: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const openLightbox = () => {
    setScale(1);
    setRotation(0);
    setOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-ink-100">
        <button
          type="button"
          onClick={openLightbox}
          className="group block w-full text-left"
          aria-label={`Открыть фото: ${label}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
            <img
              src={src}
              alt={label}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.parentElement!.style.background = "#E7E5E4";
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="bg-ink-50 px-3 py-2">
            <p className="text-[11px] font-bold text-ink-700">{label}</p>
          </div>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="truncate text-[13px] font-bold">{label}</p>
            <div className="flex items-center gap-1.5">
              <ToolbarBtn
                label="Уменьшить"
                disabled={scale <= MIN_SCALE}
                onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
              >
                <ZoomOut className="h-5 w-5" />
              </ToolbarBtn>
              <span className="w-12 text-center text-[12px] font-semibold tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <ToolbarBtn
                label="Увеличить"
                disabled={scale >= MAX_SCALE}
                onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
              >
                <ZoomIn className="h-5 w-5" />
              </ToolbarBtn>
              <ToolbarBtn label="Повернуть" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="h-5 w-5" />
              </ToolbarBtn>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15"
                aria-label="Открыть оригинал"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <ToolbarBtn label="Закрыть" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </ToolbarBtn>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
            <img
              src={src}
              alt={label}
              onClick={(e) => e.stopPropagation()}
              style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}

function ToolbarBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
