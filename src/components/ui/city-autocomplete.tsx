"use client";

import { useEffect, useRef, useState, useId, useCallback } from "react";
import { MapPin } from "lucide-react";
import { searchCities, getCities, type City } from "@/lib/api/cities";
import { cn } from "@/lib/utils/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Fires on every keystroke with the raw typed text (before dropdown selection) */
  onInputChange?: (raw: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  /** Smaller padding + font for sidebar/filter contexts */
  compact?: boolean;
  /** Remove border + ring — use when the input is inside a card that provides its own border */
  borderless?: boolean;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Returns "Регион" or "Район" label for the dropdown subtitle. */
function getSubtitle(city: City): string {
  const district = city.districtNameRu;
  const region = city.regionNameRu;
  if (district && district.trim() && district !== region) {
    return `${district}, ${region}`;
  }
  return region;
}

// Module-level cache — fetched once for the session, shared across all instances.
let popularCache: City[] | null = null;
async function loadPopularCities(): Promise<City[]> {
  if (popularCache) return popularCache;
  try {
    const all = await getCities();
    popularCache = all.slice(0, 7);
  } catch {
    popularCache = [];
  }
  return popularCache;
}

export function CityAutocomplete({
  value,
  onChange,
  onInputChange,
  placeholder = "Введите город",
  label,
  className,
  disabled,
  id: externalId,
  compact = false,
  borderless = false,
}: Props) {
  const autoId = useId();
  const inputId = externalId ?? autoId;

  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [showingPopular, setShowingPopular] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedRef = useRef(false);
  const userTypingRef = useRef(false);

  const debouncedQuery = useDebounce(query, 250);

  const calcPopup = useCallback(() => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    const minW = Math.max(280, r.width);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - minW - 8));
    setPopupStyle({ position: "fixed", top: r.bottom + 4, left, width: minW, zIndex: 9999 });
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

  // Sync external value → internal query when not actively typing.
  useEffect(() => {
    if (value !== query && !open) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current = false;
      return;
    }
    if (!debouncedQuery.trim()) {
      setResults([]);
      if (!showingPopular) setOpen(false);
      return;
    }
    setShowingPopular(false);
    setLoading(true);
    searchCities(debouncedQuery, 8)
      .then((rows) => {
        setResults(rows);
        setOpen(userTypingRef.current && rows.length > 0);
        setActiveIdx(-1);
      })
      .catch(() => {
        setResults([]);
        setOpen(false);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, showingPopular]);

  const commit = (city: City) => {
    selectedRef.current = true;
    userTypingRef.current = false;
    setShowingPopular(false);
    setQuery(city.nameRu);
    onChange(city.nameRu);
    setOpen(false);
    setResults([]);
    setActiveIdx(-1);
  };

  const handleFocus = async () => {
    if (userTypingRef.current && results.length > 0) {
      setOpen(true);
      return;
    }
    // Show popular cities when focusing on an empty input
    if (!query.trim()) {
      const popular = await loadPopularCities();
      if (popular.length > 0) {
        setResults(popular);
        setShowingPopular(true);
        setOpen(true);
        setActiveIdx(-1);
        calcPopup();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const city = results[activeIdx];
      if (city) commit(city);
    } else if (e.key === "Escape") {
      setOpen(false);
      setShowingPopular(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-500"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {!borderless && (
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            userTypingRef.current = true;
            setShowingPopular(false);
            setQuery(e.target.value);
            onChange("");
            onInputChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => {
            userTypingRef.current = false;
            // Auto-commit an exact (case-insensitive) match so typing a full city
            // name counts even without an explicit click — otherwise the value
            // stays empty and dependent submit buttons stay disabled.
            const q = query.trim().toLowerCase();
            if (q && !value) {
              const exact = results.find((c) => c.nameRu.toLowerCase() === q);
              if (exact) {
                commit(exact);
                return;
              }
            }
            setTimeout(() => {
              setOpen(false);
              setShowingPopular(false);
            }, 150);
          }}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${inputId}-list`}
          aria-activedescendant={activeIdx >= 0 ? `${inputId}-opt-${activeIdx}` : undefined}
          className={cn(
            "w-full bg-transparent font-semibold text-ink-900 outline-none dark:text-white",
            compact ? "py-1.5 text-[12px]" : "py-2 text-[14px]",
            borderless ? "pr-3" : "rounded-2xl border border-ink-200 bg-white pl-9 pr-3 focus:border-brand-500",
            "placeholder:text-ink-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        {loading && (
          <span
            className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500"
            aria-hidden="true"
          />
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          ref={listRef}
          id={`${inputId}-list`}
          role="listbox"
          style={popupStyle}
          className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft"
        >
          {showingPopular && (
            <li className="border-b border-ink-100 px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                Популярные города
              </span>
            </li>
          )}
          {results.map((city, idx) => (
            <li
              key={city.id}
              id={`${inputId}-opt-${idx}`}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(city);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 transition-colors",
                compact ? "px-3 py-1.5" : "px-4 py-2.5",
                idx === activeIdx ? "bg-brand-50" : "hover:bg-ink-50",
              )}
            >
              <MapPin className="h-3 w-3 flex-shrink-0 text-ink-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className={cn("font-bold text-ink-900", compact ? "text-[12px]" : "text-[13px]")}>{city.nameRu}</p>
                <p className="text-[10px] font-semibold text-ink-400">{getSubtitle(city)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
