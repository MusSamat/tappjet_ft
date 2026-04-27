const DAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

interface Props {
  data: Array<{ dow: number; hour: number; count: number }>;
}

export function ActivityHeatmap({ data }: Props) {
  const max = Math.max(1, ...data.map((r) => r.count));
  const cell = (dow: number, hour: number) =>
    data.find((r) => r.dow === dow && r.hour === hour)?.count ?? 0;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div
          className="mb-1 ml-8 grid text-[9px] text-slate-400"
          style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
        >
          {Array.from({ length: 24 }).map((_, h) => (
            <span key={h} className="text-center">{h % 6 === 0 ? h : ""}</span>
          ))}
        </div>
        {DAYS_SHORT.map((day, dow) => (
          <div key={dow} className="mb-0.5 flex items-center gap-1">
            <span className="w-6 flex-shrink-0 text-right text-[9px] text-slate-400">{day}</span>
            <div
              className="grid flex-1 gap-0.5"
              style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
            >
              {Array.from({ length: 24 }).map((_, hour) => {
                const count = cell(dow, hour);
                const intensity = Math.round((count / max) * 9);
                return (
                  <div
                    key={hour}
                    title={`${day} ${hour}:00 — ${count} поездок`}
                    className="aspect-square rounded-[2px]"
                    style={{
                      backgroundColor:
                        count === 0
                          ? "#f1f5f9"
                          : `hsl(170, ${40 + intensity * 6}%, ${65 - intensity * 5}%)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
