import { ExternalLink } from "lucide-react";

export function PhotoCard({ label, src }: { label: string; src: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <a href={src} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={src}
            alt={label}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget.parentElement!.style.background = "#e2e8f0");
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <ExternalLink className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-bold text-slate-700">{label}</p>
        </div>
      </a>
    </div>
  );
}
