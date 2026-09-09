import React from 'react';
import { Sparkles, AlertTriangle, Radio, School } from 'lucide-react';

interface HeaderProps {
  disruptionsActive: boolean;
  incidentCount: number;
  onOpenIncidentsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  disruptionsActive,
  incidentCount,
  onOpenIncidentsModal,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Title & AI Smart Mobility Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Smart Student Commute Companion
              </h1>
              <span
                id="badge-ai-mobility"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                AI Smart Mobility
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intelligent multi-modal routing & real-time disruption bypass for Mumbai student commutes
            </p>
          </div>
        </div>

        {/* Status Indicators & Incident CTA */}
        <div className="flex items-center gap-2.5">
          {/* Live Disruption Simulator Status Pill */}
          <div
            id="status-disruption-pill"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
              disruptionsActive
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${disruptionsActive ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Disruptions: <b>{disruptionsActive ? 'Simulated Active' : 'Normal Transit'}</b></span>
          </div>

          {/* Incident Feed Quick Button */}
          <button
            id="btn-header-incident-feed"
            onClick={onOpenIncidentsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Live Alerts ({incidentCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
