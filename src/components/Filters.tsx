import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface FiltersProps {
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  availableDomains: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
  availableTypes: string[];
  totalResults: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
  selectedDomain,
  onSelectDomain,
  availableDomains,
  selectedType,
  onSelectType,
  availableTypes,
  totalResults,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Results Counter for Screen Readers and Users */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900" id="filter-heading">
              Available Openings
            </h2>
            <p className="text-xs text-slate-500" role="status" aria-live="polite">
              Showing <span className="font-semibold text-slate-800">{totalResults}</span> vetted internships
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Domain Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="domain-filter-select" className="text-xs font-semibold text-slate-600">
              Domain:
            </label>
            <select
              id="domain-filter-select"
              value={selectedDomain}
              onChange={(e) => onSelectDomain(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableDomains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Work Type Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="type-filter-select" className="text-xs font-semibold text-slate-600">
              Work Mode:
            </label>
            <select
              id="type-filter-select"
              value={selectedType}
              onChange={(e) => onSelectType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              aria-label="Reset all search filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
