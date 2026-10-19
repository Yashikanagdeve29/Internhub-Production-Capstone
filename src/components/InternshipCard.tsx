import React from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  ChevronRight,
  Send,
  Building,
} from 'lucide-react';
import { Internship } from '../types.ts';

interface InternshipCardProps {
  internship: Internship;
  onViewDetails: (internship: Internship) => void;
  onApply: (internship: Internship) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  onViewDetails,
  onApply,
}) => {
  // Domain color mappings for visual hierarchy
  const getDomainStyle = (domain: string) => {
    switch (domain) {
      case 'Software Engineering':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Data & AI':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Product Design':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'DevOps & Cloud':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Cybersecurity':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCompanyInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between p-5 sm:p-6">
      <div>
        {/* Top Header: Company initial + Domain pill + Type pill */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-200/60 flex items-center justify-center font-bold text-lg text-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
              {getCompanyInitial(internship.company)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {internship.company}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{internship.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDomainStyle(
                internship.domain
              )}`}
            >
              {internship.domain}
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {internship.type}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {internship.title}
        </h4>

        {/* Description Excerpt */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {internship.description}
        </p>

        {/* Meta Pills: Stipend, Duration, Deadline */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{internship.stipend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{internship.duration}</span>
          </div>
        </div>

        {/* Requirements Preview Tags */}
        {internship.requirements && internship.requirements.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {internship.requirements.slice(0, 2).map((req, i) => (
              <span
                key={i}
                className="inline-block text-[11px] bg-slate-50 text-slate-600 border border-slate-200/70 rounded-md px-2 py-0.5 truncate max-w-[200px]"
                title={req}
              >
                • {req}
              </span>
            ))}
            {internship.requirements.length > 2 && (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                +{internship.requirements.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(internship)}
          className="flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`View details for ${internship.title} at ${internship.company}`}
        >
          View Details
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onApply(internship)}
          className="flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Apply now for ${internship.title} at ${internship.company}`}
        >
          Apply Now
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
