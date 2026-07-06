"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { searchCities, type City } from "@/lib/api/cities";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "./spinner";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  /** City names to keep out of the suggestions (origin + destination). */
  exclude?: string[];
  label: string;
  placeholder: string;
  /** Shown in the dropdown when a search yields nothing. */
  emptyHint: string;
  max?: number;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Compact multi-select over the whole city directory. The dropdown is rendered
 * with `position: fixed` (coordinates from the input rect) so it escapes the
 * `overflow-hidden` card it lives in instead of being clipped behind it.
 */
export function RouteCitiesPicker({
  value,
  onChange,
  exclude = [],
  label,
  placeholder,
  emptyHint,
  max = 5,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 250);

  const inputRef = useRef<HTMLInputElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const calcPopup = useCallback(() => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setPopupStyle({ position: "fixed", top: r.bottom + 4, left: r.left, width: r.width, zIndex: 9999 });
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPopup();
    window.addEventListener("scroll", calcPopup, true);
    window.addEventListener("resize", calcPopup);
    return () => {
      window.removeEventListener("scroll", calcPopup, true);
      window.removeEventListener("resize", calcPopup);
    };
  }, [open, calcPopup]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["city-search", debounced],
    enabled: debounced.trim().length > 0,
    staleTime: 60_000,
    queryFn: (): Promise<City[]> => searchCities(debounced, 8),
  });

  const blocked = new Set([...exclude, ...value]);
  const available = results.filter((c) => !blocked.has(c.nameRu));
  const atMax = value.length >= max;

  const add = (name: string) => {
    if (value.length < max && !value.includes(name)) onChange([...value, name]);
    setQuery("");
    setOpen(false);
  };
  const remove = (name: string) => onChange(value.filter((n) => n !== name));

  return (
    <div className="flex flex-col gap-1.5 border-t border-dashed border-ink-200 pt-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-ink-500">{label}</span>
        {value.length > 0 && (
          <span className="text-[10px] font-bold text-brand-600">
            {value.length}/{max}
          </span>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full border border-brand-400 bg-brand-50 py-0.5 pl-2.5 pr-1 text-[12px] font-bold text-brand-700"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(name)}
                aria-label={`Убрать ${name}`}
                className="rounded-full p-0.5 hover:bg-brand-100"
              >
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {!atMax && (
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="w-full rounded-lg border border-ink-200 bg-white py-1.5 pl-8 pr-7 text-[12px] font-semibold text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
          {isFetching && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Spinner size={12} />
            </span>
          )}
        </div>
      )}

      {open && debounced.trim().length > 0 && (available.length > 0 || !isFetching) && (
        <ul
          style={popupStyle}
          className="max-h-60 overflow-auto rounded-2xl border border-ink-100 bg-white shadow-soft"
        >
          {available.length === 0 ? (
            <li className="px-3 py-2 text-[12px] font-semibold text-ink-400">{emptyHint}</li>
          ) : (
            available.map((c) => (
              <li
                key={c.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(c.nameRu);
                }}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-brand-50"
              >
                <MapPin className="h-3 w-3 flex-shrink-0 text-ink-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-ink-900">{c.nameRu}</p>
                  <p className="text-[11px] font-semibold text-ink-400">{c.regionNameRu}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
