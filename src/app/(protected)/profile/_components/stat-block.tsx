export function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[24px] font-extrabold leading-none text-teal-700">{value}</span>
      <span className="text-[11px] font-semibold text-gray-500">{label}</span>
    </div>
  );
}
