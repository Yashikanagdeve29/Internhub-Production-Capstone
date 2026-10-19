/**
 * InternHub — Full-Stack Internship Portal
 * Capstone Final Milestone Application Entry Point
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { Filters } from './components/Filters.tsx';
import { InternshipCard } from './components/InternshipCard.tsx';
import { InternshipModal } from './components/InternshipModal.tsx';
import { ApplicationModal } from './components/ApplicationModal.tsx';
import { StatusLookupModal } from './components/StatusLookupModal.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { HealthModal } from './components/HealthModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Internship, Pagination, PortalStats, ApiResponse } from './types.ts';
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Search,
  CheckCircle2,
} from 'lucide-react';

const DOMAINS = [
  'All',
  'Software Engineering',
  'Data & AI',
  'Product Design',
  'DevOps & Cloud',
  'Cybersecurity',
];

const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'];

export default function App() {
  // Portal Data States
  const [internships, setInternships] = useState<Internship[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState<PortalStats>({
    activeInternships: 8,
    totalApplications: 0,
    partnerCompanies: 8,
    domains: 5,
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Status States
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(true);

  // Modal Dialog States
  const [selectedInternshipForDetails, setSelectedInternshipForDetails] = useState<Internship | null>(null);
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState<Internship | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  const internshipsSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Internships from Real Backend API
  const fetchInternships = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedDomain && selectedDomain !== 'All') params.set('domain', selectedDomain);
      if (selectedType && selectedType !== 'All') params.set('type', selectedType);
      params.set('page', currentPage.toString());
      params.set('limit', '6');

      const response = await fetch(`/api/internships?${params.toString()}`);
      const json: ApiResponse<Internship[]> = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch internship records from server.');
      }

      setInternships(json.data);
      if (json.pagination) {
        setPagination(json.pagination);
      }
      setApiConnected(true);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Error connecting to backend database.');
      setApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDomain, selectedType, currentPage]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (res.ok && json.success) {
        setStats(json.data);
      }
    } catch {
      // Ignore background stats error
    }
  }, []);

  // Health check polling on load
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      setApiConnected(res.ok && json.success);
    } catch {
      setApiConnected(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchStats();
  }, [checkHealth, fetchStats]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchInternships]);

  // Handle Domain Selection
  const handleSelectDomain = (domain: string) => {
    setSelectedDomain(domain);
    setCurrentPage(1);
  };

  // Handle Type Selection
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDomain('All');
    setSelectedType('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedDomain !== 'All' || selectedType !== 'All');

  // Callback when application is successfully submitted
  const handleApplicationSubmitted = () => {
    fetchStats();
  };

  // Callback when new internship is posted via admin
  const handleInternshipCreated = () => {
    fetchInternships();
    fetchStats();
  };

  const scrollToInternships = () => {
    internshipsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Accessible Navbar */}
      <Navbar
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHealth={() => setIsHealthOpen(true)}
        apiConnected={apiConnected}
        onScrollToInternships={scrollToInternships}
      />

      {/* 2. Hero Section with Live Stats and Search */}
      <Hero
        stats={stats}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedDomain={selectedDomain}
        onSelectDomain={handleSelectDomain}
        availableDomains={DOMAINS}
      />

      {/* 3. Main Content: Internship Listings */}
      <main id="main-content" ref={internshipsSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Toolbar */}
        <Filters
          selectedDomain={selectedDomain}
          onSelectDomain={handleSelectDomain}
          availableDomains={DOMAINS}
          selectedType={selectedType}
          onSelectType={handleSelectType}
          availableTypes={WORK_TYPES}
          totalResults={pagination.total}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading internships from persistent database...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div
            role="alert"
            className="p-8 my-6 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-3"
          >
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">Failed to Load Internships</h3>
            <p className="text-xs text-rose-700">{fetchError}</p>
            <button
              type="button"
              onClick={fetchInternships}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !fetchError && internships.length === 0 && (
          <div className="py-16 text-center max-w-md mx-auto space-y-3 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching internships found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any openings matching your search criteria. Try modifying your keywords or resetting filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Internship Cards Grid */}
        {!isLoading && !fetchError && internships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onViewDetails={(item) => setSelectedInternshipForDetails(item)}
                onApply={(item) => setSelectedInternshipForApply(item)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !fetchError && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-800">{pagination.totalPages}</span> (Total{' '}
              {pagination.total} roles)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  scrollToInternships();
                }}
                disabled={!pagination.hasPrev}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  scrollToInternships();
                }}
                disabled={!pagination.hasNext}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Go to next page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. Modals */}
      {/* Internship Full Details Modal */}
      <InternshipModal
        internship={selectedInternshipForDetails}
        isOpen={Boolean(selectedInternshipForDetails)}
        onClose={() => setSelectedInternshipForDetails(null)}
        onApply={(item) => {
          setSelectedInternshipForDetails(null);
          setSelectedInternshipForApply(item);
        }}
      />

      {/* Application Submission Form Modal */}
      <ApplicationModal
        internship={selectedInternshipForApply}
        isOpen={Boolean(selectedInternshipForApply)}
        onClose={() => setSelectedInternshipForApply(null)}
        onApplicationSubmitted={handleApplicationSubmitted}
      />

      {/* Application Status Lookup Modal */}
      <StatusLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      {/* Admin Protected Creation Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onInternshipCreated={handleInternshipCreated}
      />

      {/* Health Diagnostics Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* 5. Accessible Footer */}
      <Footer />
    </div>
  );
}
