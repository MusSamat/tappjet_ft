import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  href?: string;
}

export function KpiCard({ label, value, sub, icon: Icon, accent, href }: Props) {
  const content = (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-sm transition-shadow",
        href && "hover:shadow-md cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className={cn("mt-1 text-[28px] font-extrabold leading-none", accent ?? "text-slate-900")}>
            {value}
          </p>
          {sub && <p className="mt-1 text-[12px] text-slate-500">{sub}</p>}
        </div>
        <span className={cn("rounded-xl p-2.5", accent ? "bg-opacity-10" : "bg-slate-100")}>
          <Icon className={cn("h-5 w-5", accent ?? "text-slate-500")} />
        </span>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}
