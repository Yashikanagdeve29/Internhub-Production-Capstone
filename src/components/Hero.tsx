import React from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { PortalStats } from '../types.ts';

interface HeroProps {
  stats: PortalStats;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  availableDomains: string[];
}

export const Hero: React.FC<HeroProps> = ({
  stats,
  searchTerm,
  onSearchChange,
  selectedDomain,
  onSelectDomain,
  availableDomains,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50 pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-slate-200/60">
      {/* Subtle background decorative grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-semibold text-indigo-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Milestone 3 & Capstone Complete — Full-Stack Integration</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Discover & Apply to High-Impact{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Tech Internships
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Vetted software engineering, data & AI, design, and cybersecurity roles. Powered by persistent SQLite storage, strict client/server validation, and production-grade security.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white rounded-2xl shadow-md shadow-indigo-100/50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all p-2">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="hero-search-input"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by role title, company, skills (e.g. React, Python, Cloud)..."
              className="w-full px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-none"
              aria-label="Search internships by keywords or role title"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors mr-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Domain Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto" role="group" aria-label="Filter by domain">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Popular Domains:</span>
          {availableDomains.map((domain) => {
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => onSelectDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-1'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                aria-pressed={isSelected}
              >
                {domain}
              </button>
            );
          })}
        </div>

        {/* Live Portal Statistics Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Roles</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.activeInternships || 8}</div>
            <p className="text-xs text-slate-500 mt-0.5">Live in SQLite DB</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalApplications || 0}</div>
            <p className="text-xs text-slate-500 mt-0.5">Persisted & Verified</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partners</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.partnerCompanies || 8}</div>
            <p className="text-xs text-slate-500 mt-0.5">Top Tech Organizations</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domains</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.domains || 5}</div>
            <p className="text-xs text-slate-500 mt-0.5">Engineering to Design</p>
          </div>
        </div>
      </div>
    </section>
  );
};
