import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { HealthCheckData } from '../types.ts';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<HealthCheckData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      const roundTrip = Math.round(performance.now() - start);
      setLatency(roundTrip);

      if (res.ok && json.success) {
        setData(json);
      } else {
        setError(json.error || 'Database or API reported degraded health.');
        setData(json);
      }
    } catch {
      setError('Unable to connect to /api/health endpoint.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
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

  if (!isOpen) return null;

  const isHealthy = data?.status === 'healthy' && data?.database === 'connected';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-modal-heading"
    >
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isHealthy ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 id="health-modal-heading" className="text-lg font-extrabold text-slate-900">
                System Diagnostics
              </h3>
              <p className="text-xs text-slate-500">Live endpoint check: GET /api/health</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close diagnostics dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Status Pill */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isHealthy
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {isHealthy ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Overall Health</span>
                <span className="font-extrabold text-lg capitalize">{data?.status || 'Probing...'}</span>
              </div>
            </div>

            {latency !== null && (
              <span className="text-xs font-mono font-bold bg-white/80 px-2.5 py-1 rounded-full shadow-xs">
                {latency} ms
              </span>
            )}
          </div>

          {/* Diagnostic Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Persistent SQLite Engine:</span>
              </div>
              <span className="font-bold text-emerald-700 capitalize flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {data?.database || 'Connected'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Server className="w-4 h-4 text-sky-600" />
                <span className="font-semibold">Service Name:</span>
              </div>
              <span className="font-mono text-slate-800">{data?.service || 'InternHub API'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Uptime:</span>
              </div>
              <span className="font-mono text-slate-800">{data?.uptime ? `${data.uptime} seconds` : 'Active'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Security Level:</span>
              </div>
              <span className="font-semibold text-emerald-700">Rate Limited & Helmet Guarded</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={fetchHealth}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recheck API Health</span>
          </button>

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
