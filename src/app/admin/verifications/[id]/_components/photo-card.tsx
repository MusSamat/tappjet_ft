"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, ZoomIn, ZoomOut, RotateCw, X, Maximize2 } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 0.35;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function PhotoCard({ label, src }: { label: string; src: string }) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const reset = () => { setScale(1); setRotation(0); setPos({ x: 0, y: 0 }); };
  const openLightbox = () => { reset(); setOpen(true); };
  const zoomBy = (d: number) => setScale((s) => { const n = clamp(+(s + d).toFixed(2), MIN_SCALE, MAX_SCALE); if (n === 1) setPos({ x: 0, y: 0 }); return n; });

  // Keyboard: +/- zoom, r rotate, 0 reset, Esc close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "+" || e.key === "=") zoomBy(SCALE_STEP);
      else if (e.key === "-") zoomBy(-SCALE_STEP);
      else if (e.key.toLowerCase() === "r") setRotation((r) => (r + 90) % 360);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-ink-100">
        <button type="button" onClick={openLightbox} className="group block w-full text-left" aria-label={`Открыть фото: ${label}`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
            <img
              src={src}
              alt={label}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => { e.currentTarget.parentElement!.style.background = "#E7E5E4"; e.currentTarget.style.display = "none"; }}
            />
            <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div className="bg-ink-50 px-3 py-2">
            <p className="text-[12px] font-bold text-ink-700">{label}</p>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label={label} onClick={() => setOpen(false)}>
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="truncate text-[14px] font-bold">{label}</p>
            <div className="flex items-center gap-1.5">
              <ToolbarBtn label="Уменьшить" disabled={scale <= MIN_SCALE} onClick={() => zoomBy(-SCALE_STEP)}><ZoomOut className="h-5 w-5" /></ToolbarBtn>
              <span className="w-12 text-center text-[12px] font-semibold tabular-nums">{Math.round(scale * 100)}%</span>
              <ToolbarBtn label="Увеличить" disabled={scale >= MAX_SCALE} onClick={() => zoomBy(SCALE_STEP)}><ZoomIn className="h-5 w-5" /></ToolbarBtn>
              <ToolbarBtn label="Повернуть" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw className="h-5 w-5" /></ToolbarBtn>
              <a href={src} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15" aria-label="Открыть оригинал"><ExternalLink className="h-5 w-5" /></a>
              <ToolbarBtn label="Закрыть" onClick={() => setOpen(false)}><X className="h-5 w-5" /></ToolbarBtn>
            </div>
          </div>

          {/* Scroll to zoom · drag to pan · double-click to toggle. */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => zoomBy(e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP)}
            onDoubleClick={() => (scale > 1 ? reset() : setScale(2.6))}
            onPointerDown={(e) => { if (scale > 1) { drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }; (e.target as Element).setPointerCapture?.(e.pointerId); } }}
            onPointerMove={(e) => { const d = drag.current; if (d) setPos({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }); }}
            onPointerUp={() => { drag.current = null; }}
            style={{ cursor: scale > 1 ? (drag.current ? "grabbing" : "grab") : "zoom-in", touchAction: "none" }}
          >
            <img
              src={src}
              alt={label}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)` }}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-75"
              draggable={false}
            />
          </div>
          <p className="pb-3 text-center text-[11px] text-white/40">Колесо — масштаб · тянуть — перемещение · двойной клик — приблизить · R — повернуть · Esc — закрыть</p>
        </div>
      )}
    </>
  );
}

function ToolbarBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15 disabled:opacity-30">
      {children}
    </button>
  );
}
