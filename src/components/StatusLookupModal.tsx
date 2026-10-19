import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  Building,
  GraduationCap,
  Calendar,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ApplicationLookupResult } from '../types.ts';

interface StatusLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusLookupModal: React.FC<StatusLookupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [refInput, setRefInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationLookupResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setResult(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = refInput.trim().toUpperCase();
    if (!query) {
      setError('Please enter an application reference ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/applications/lookup/${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'No matching application found for this reference code.');
        setIsLoading(false);
        return;
      }

      setResult(data.data);
      setIsLoading(false);
    } catch {
      setError('Failed to reach server. Please check your network connection.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookup-modal-heading"
    >
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 id="lookup-modal-heading" className="text-lg font-extrabold text-slate-900">
                Application Status Verification
              </h3>
              <p className="text-xs text-slate-500">Query live records directly from SQLite database</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close status lookup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <label htmlFor="lookup-ref-input" className="block text-xs font-bold text-slate-700">
              Enter Reference ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="lookup-ref-input"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                placeholder="e.g. APP-2026-XXXX"
                className="flex-1 px-3.5 py-2 font-mono text-sm uppercase rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Verify</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700">{result.applicationRef}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {result.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{result.internshipTitle}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {result.company}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Applicant:</span>
                  <span className="font-semibold text-slate-800">{result.applicantNameMasked}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">University:</span>
                  <span className="font-semibold text-slate-800 truncate block">{result.college}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Major:</span>
                  <span className="font-semibold text-slate-800 truncate block">{result.degree}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified record in InternHub persistent SQLite database.</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
