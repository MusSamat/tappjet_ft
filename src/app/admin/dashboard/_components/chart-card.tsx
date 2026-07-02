export function ChartCard({
  title,
  children,
  loading,
}: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="mb-4 text-[13px] font-bold text-ink-700">{title}</p>
      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-ink-600" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
