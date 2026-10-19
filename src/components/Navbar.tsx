import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  PlusCircle,
  Activity,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
  onOpenHealth: () => void;
  apiConnected: boolean;
  onScrollToInternships: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLookup,
  onOpenAdmin,
  onOpenHealth,
  apiConnected,
  onScrollToInternships,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Skip to Main Content Link for WCAG 2.2 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
              aria-label="InternHub - Return to homepage"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  Intern<span className="text-indigo-600">Hub</span>
                </span>
                <span className="hidden sm:block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Production Capstone
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2" aria-label="Main Navigation">
            <button
              onClick={onScrollToInternships}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Explore Roles
            </button>

            <button
              onClick={onOpenLookup}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Check Application Status
            </button>

            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              Post Role (Admin)
            </button>

            {/* Health Monitor Trigger */}
            <button
              onClick={onOpenHealth}
              className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                apiConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view live API & Database Diagnostics"
              aria-label="System Health Status: Click for Diagnostics"
            >
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden lg:inline">{apiConnected ? 'API & SQLite: Healthy' : 'API: Reconnecting'}</span>
              <Activity className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenHealth}
              className={`p-1.5 rounded-full border text-xs ${
                apiConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              aria-label="Health Status"
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToInternships();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Explore Roles
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLookup();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-500" />
            Check Application Status
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            Post Role (Admin Mode)
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenHealth();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            System Health Diagnostics
          </button>
        </div>
      )}
    </header>
  );
};
