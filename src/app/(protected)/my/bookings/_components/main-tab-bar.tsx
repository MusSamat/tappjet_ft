"use client";

import { cn } from "@/lib/utils/cn";

type MainTab = "passenger" | "driver" | "requests";

interface TabDef {
  id: MainTab;
  label: string;
  labelShort: string;
  count: number | null;
  highlight?: boolean;
}

interface Props {
  tabs: TabDef[];
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

export function MainTabBar({ tabs, active, onChange }: Props) {
  return (
    <div className="tabs-scroll mb-5 flex overflow-x-auto border-b border-gray-200">
      {tabs.map(({ id, label, labelShort, count, highlight }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12px] font-bold transition-colors sm:px-4 sm:text-[13px]",
            active === id
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          <span className="sm:hidden">{labelShort}</span>
          <span className="hidden sm:inline">{label}</span>
          {count !== null && (
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
              active === id
                ? "bg-teal-100 text-teal-700"
                : (highlight ?? false)
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600",
            )}>
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
