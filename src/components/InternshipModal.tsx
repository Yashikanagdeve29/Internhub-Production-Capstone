import React, { useEffect } from 'react';
import {
  X,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  ListChecks,
  Briefcase,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Internship } from '../types.ts';

interface InternshipModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (internship: Internship) => void;
}

export const InternshipModal: React.FC<InternshipModalProps> = ({
  internship,
  isOpen,
  onClose,
  onApply,
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !internship) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="internship-modal-title"
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {internship.domain}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                {internship.type}
              </span>
            </div>
            <h3 id="internship-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {internship.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <span className="font-semibold text-slate-800">{internship.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {internship.location}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Key Facts Banner */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/70">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Stipend</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {internship.stipend}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Duration</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-sky-600" />
                {internship.duration}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Deadline</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                {internship.deadline}
              </span>
            </div>
          </div>

          {/* Role Overview */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-2">Role Overview</h4>
            <p className="leading-relaxed text-slate-600">{internship.description}</p>
          </div>

          {/* Key Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-indigo-600" />
                What You'll Do
              </h4>
              <ul className="space-y-2 text-slate-600">
                {internship.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications & Requirements */}
          {internship.requirements && internship.requirements.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Requirements & Qualifications
              </h4>
              <ul className="space-y-2 text-slate-600">
                {internship.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Program Perks & Mentorship */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Internship Program Highlights
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              1-on-1 mentorship with dedicated staff engineers, weekly tech talks, company hardware stipend, flexible PTO, and direct evaluation for return full-time new grad offers.
            </p>
          </div>
        </div>

        {/* Modal Footer / CTAs */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onApply(internship);
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Apply for this Internship
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
