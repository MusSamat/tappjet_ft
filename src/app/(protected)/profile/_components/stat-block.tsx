export function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[24px] font-extrabold leading-none text-brand-700">{value}</span>
      <span className="text-[11px] font-semibold text-ink-500">{label}</span>
    </div>
  );
}
