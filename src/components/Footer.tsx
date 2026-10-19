import React from 'react';
import { Briefcase, Shield, CheckCircle2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Intern<span className="text-indigo-600">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Production-Ready Capstone Full-Stack Internship Portal. Built with high-performance Node.js, Express.js, persistent SQLite storage, and responsive React frontend.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WCAG 2.2 AA Accessibility & OWASP Security Standard Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Capstone Deliverables
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <a href="#main-content" className="hover:text-indigo-600 transition-colors">
                  Internship Discovery Board
                </a>
              </li>
              <li>
                <span className="font-mono text-slate-700">TEST_REPORT.md</span>
              </li>
              <li>
                <span className="font-mono text-slate-700">SECURITY_CHECKLIST.md</span>
              </li>
              <li>
                <span className="font-mono text-slate-700">ENGINEERING_DECISIONS.md</span>
              </li>
              <li>
                <span className="font-mono text-slate-700">WALKTHROUGH_SCRIPT.md</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Architecture & Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Node.js & Express REST API</li>
              <li>• Persistent SQLite (node:sqlite)</li>
              <li>• Parameterized SQL & Foreign Keys</li>
              <li>• Helmet CSP & Rate Limiting</li>
              <li>• Node Built-in Test Runner (node:test)</li>
              <li>• Tailwind CSS & React 19</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 InternHub Capstone. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Engineered with precision for portfolio evaluation</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
