import { useState, useRef, useEffect, useCallback } from "react";
import {
  METRICS,
  MAX_VISIBLE_LINES,
  type MetricKey,
} from "../constants/metrics";

export interface DashboardControlsProps {
  metric: MetricKey;
  onMetricChange: (value: MetricKey) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  incomeFilter: string;
  onIncomeFilterChange: (value: string) => void;
  selectedCountryCodes: Set<string>;
  onAddCountry: (code: string) => void;
  onRemoveCountry: (code: string) => void;
  regions: string[];
  incomes: string[];
  /** All country options pre-filtered by region+income (no text search applied). */
  countryOptions: { code: string; name: string }[];
}

const SELECT_CLS =
  "rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export function DashboardControls({
  metric,
  onMetricChange,
  regionFilter,
  onRegionFilterChange,
  incomeFilter,
  onIncomeFilterChange,
  selectedCountryCodes,
  onAddCountry,
  onRemoveCountry,
  regions,
  incomes,
  countryOptions,
}: DashboardControlsProps) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // One chip per selected code (single source of truth = selectedCountryCodes)
  const allChips = Array.from(selectedCountryCodes).map((code) => {
    const o = countryOptions.find((opt) => opt.code === code);
    return { code, name: o?.name ?? code };
  });

  const dropdownItems = countryOptions
    .filter(
      (o) =>
        !selectedCountryCodes.has(o.code) &&
        (o.name.toLowerCase().includes(query.toLowerCase()) ||
          o.code.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 40);

  const atMax = selectedCountryCodes.size >= MAX_VISIBLE_LINES;

  const addCountry = useCallback(
    (code: string) => {
      if (!atMax) {
        onAddCountry(code);
        setQuery("");
        setActiveIdx(-1);
        inputRef.current?.focus();
      }
    },
    [atMax, onAddCountry],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, dropdownItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target =
        activeIdx >= 0 ? dropdownItems[activeIdx] : dropdownItems[0];
      if (target) addCountry(target.code);
    } else if (e.key === "Backspace" && query === "" && allChips.length > 0) {
      onRemoveCountry(allChips[allChips.length - 1].code);
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setActiveIdx(-1);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll active dropdown item into view
  useEffect(() => {
    if (activeIdx >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.querySelectorAll("[data-item]")[
        activeIdx
      ] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  return (
    <section className="shrink-0 mb-6 rounded-xl border border-slate-200/60 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-900 shadow-sm overflow-hidden">
      {/* Row 1: Metric tabs */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 mb-2">
          Metric
        </p>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => onMetricChange(m.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                metric === m.value
                  ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Narrow-by filters */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 shrink-0">
          Narrow by
        </p>
        <div className="flex items-center gap-2">
          <label
            htmlFor="region"
            className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
          >
            Region
          </label>
          <select
            id="region"
            value={regionFilter}
            onChange={(e) => onRegionFilterChange(e.target.value)}
            className={SELECT_CLS}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="income"
            className="text-sm text-slate-600 dark:text-zinc-400 shrink-0"
          >
            Income
          </label>
          <select
            id="income"
            value={incomeFilter}
            onChange={(e) => onIncomeFilterChange(e.target.value)}
            className={SELECT_CLS}
          >
            {incomes.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-400 dark:text-zinc-500 ml-auto shrink-0">
          {countryOptions.length} countries match filters
        </p>
      </div>

      {/* Row 3: Country combobox */}
      <div className="px-4 py-3" ref={containerRef}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
            Countries on chart
          </p>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              atMax
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {selectedCountryCodes.size} / {MAX_VISIBLE_LINES}
          </span>
        </div>

        {/* Chips + input */}
        <div
          className={`flex flex-wrap gap-1.5 min-h-[40px] rounded-lg border px-3 py-2 bg-slate-50 dark:bg-zinc-800 cursor-text transition-colors ${
            dropdownOpen
              ? "border-sky-500 ring-2 ring-sky-500/20"
              : "border-slate-300 dark:border-zinc-600"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {allChips.map(({ code, name }) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 text-xs font-medium"
            >
              {name}
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveCountry(code);
                }}
                className="hover:text-sky-600 dark:hover:text-sky-200 leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              allChips.length === 0
                ? "Search and add countries…"
                : atMax
                  ? `Max ${MAX_VISIBLE_LINES} selected`
                  : "Add country…"
            }
            disabled={atMax && query === ""}
            className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="relative z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 shadow-xl text-sm"
          >
            {dropdownItems.length === 0 ? (
              <div className="px-4 py-3 text-slate-400 dark:text-zinc-500 text-sm">
                {atMax
                  ? `Max ${MAX_VISIBLE_LINES} countries selected`
                  : "No countries match"}
              </div>
            ) : (
              dropdownItems.map((item, i) => (
                <button
                  key={item.code}
                  data-item
                  type="button"
                  disabled={atMax}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addCountry(item.code);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between gap-3 transition-colors ${
                    i === activeIdx
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                      : "text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  } ${atMax ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 shrink-0">
                    {item.code}
                  </span>
                </button>
              ))
            )}
            {countryOptions.filter(
              (o) =>
                !selectedCountryCodes.has(o.code) &&
                (o.name.toLowerCase().includes(query.toLowerCase()) ||
                  o.code.toLowerCase().includes(query.toLowerCase())),
            ).length > 40 && (
              <div className="px-4 py-2 text-xs text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-zinc-800">
                Showing 40 of many — keep typing to narrow results
              </div>
            )}
          </div>
        )}

        {atMax && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Limit reached. Remove a country first to add another.
          </p>
        )}
      </div>
    </section>
  );
}
