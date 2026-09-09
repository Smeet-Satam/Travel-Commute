import React from 'react';
import { 
  Sparkles, 
  Clock, 
  Coins, 
  HeartHandshake, 
  Footprints, 
  TrainFront, 
  Bus, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Radio,
  ExternalLink
} from 'lucide-react';
import { CommuteRoute, RouteStep, TransitMode } from '../types';

interface RouteResultsProps {
  recommendedRoute: CommuteRoute;
  alternativeRoutes: CommuteRoute[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  onOpenIncidentModal: () => void;
  disruptionsActive: boolean;
}

export const RouteResults: React.FC<RouteResultsProps> = ({
  recommendedRoute,
  alternativeRoutes,
  selectedRouteId,
  onSelectRoute,
  onOpenIncidentModal,
  disruptionsActive,
}) => {
  // Helper for mode icons
  const renderModeIcon = (mode: TransitMode, className = "w-4 h-4") => {
    switch (mode) {
      case 'train':
        return <TrainFront className={`${className} text-blue-600`} />;
      case 'metro':
        return <TrainFront className={`${className} text-teal-600`} />;
      case 'bus':
        return <Bus className={`${className} text-amber-600`} />;
      case 'auto':
        return <Car className={`${className} text-emerald-600`} />;
      case 'walk':
      default:
        return <Footprints className={`${className} text-slate-500`} />;
    }
  };

  const getModeLabel = (mode: TransitMode) => {
    switch (mode) {
      case 'train': return 'Local Train';
      case 'metro': return 'Metro';
      case 'bus': return 'BEST Bus';
      case 'auto': return 'Auto / Cab';
      case 'walk': return 'Walking';
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Highlighted Card: AI Recommended Route */}
      <div 
        id="card-ai-recommended-route"
        className={`rounded-2xl border-2 transition-all p-5 shadow-sm ${
          recommendedRoute.isDisruptionDetour
            ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-400/90 ring-2 ring-amber-400/20'
            : 'bg-gradient-to-b from-emerald-50/50 via-white to-white border-emerald-500/80 shadow-emerald-500/5 ring-1 ring-emerald-500/20'
        }`}
      >
        {/* Header Ribbon / Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              recommendedRoute.isDisruptionDetour
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              {recommendedRoute.isDisruptionDetour ? '⚡ AI SMART DETOUR' : '★ AI RECOMMENDED ROUTE'}
            </span>
            {recommendedRoute.isDisruptionDetour && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                Bypasses Signal Delay
              </span>
            )}
          </div>

          {/* Quick transit modes badge array */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Modes:</span>
            {recommendedRoute.transitModes.map((mode, idx) => (
              <React.Fragment key={`${mode}-${idx}`}>
                <div 
                  className="p-1 rounded bg-white shadow-2xs border border-slate-100" 
                  title={getModeLabel(mode)}
                >
                  {renderModeIcon(mode, "w-3.5 h-3.5")}
                </div>
                {idx < recommendedRoute.transitModes.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Route Title & Key Metrics Grid */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {recommendedRoute.title}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {recommendedRoute.tagline}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Travel Time</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {recommendedRoute.totalDurationMinutes} <span className="text-xs font-normal text-slate-500">mins</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Cost</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ₹{recommendedRoute.totalCostRs}
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                <span>Comfort Score</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-1">
                {recommendedRoute.comfortScore}
                <span className="text-xs font-normal text-slate-500">/ 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROMINENT BADGE: AI Decision Reasoning */}
        <div 
          id="badge-ai-decision-reasoning"
          className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 p-3.5 shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-900">
              AI Decision Reasoning
            </span>
            <span className="text-[10px] bg-white/80 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-300">
              Real-time Analysis
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-800 font-medium pl-8">
            {recommendedRoute.aiReasoning}
          </p>
        </div>

        {/* Step-by-Step Itinerary Breakdown */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Step-by-Step Itinerary Breakdown
            </h4>
            <span className="text-[11px] text-slate-500">
              {recommendedRoute.steps.length} stages • Seamless Transit
            </span>
          </div>

          <div className="space-y-3 relative pl-3 before:absolute before:left-5 before:top-2 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {recommendedRoute.steps.map((step, idx) => (
              <div key={step.id} className="relative flex items-start gap-3 text-xs group">
                {/* Mode Icon Pin */}
                <div className="relative z-10 w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs shrink-0 group-hover:border-emerald-500 transition-colors">
                  {renderModeIcon(step.mode, "w-3.5 h-3.5")}
                </div>

                {/* Step Details Content */}
                <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 rounded-lg p-2.5 border border-slate-200/70 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs">
                      Step {idx + 1}: {step.instruction}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 shrink-0">
                      {step.durationMinutes} min ({step.distanceKm} km)
                    </span>
                  </div>

                  {step.transitDetails && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      {step.transitDetails.lineOrNumber && (
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">
                          {step.transitDetails.lineOrNumber}
                        </span>
                      )}
                      {step.transitDetails.isAC && (
                        <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 font-medium">
                          AC Coach
                        </span>
                      )}
                      {step.transitDetails.fareRs !== undefined && (
                        <span className="text-slate-700">
                          Fare: <b>₹{step.transitDetails.fareRs}</b>
                        </span>
                      )}
                      {step.transitDetails.crowdLevel && (
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          step.transitDetails.crowdLevel === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                          step.transitDetails.crowdLevel === 'Medium' ? 'bg-blue-50 text-blue-700' :
                          'bg-red-50 text-red-700 font-bold'
                        }`}>
                          Crowd: {step.transitDetails.crowdLevel}
                        </span>
                      )}
                      {step.transitDetails.frequencyMinutes && (
                        <span className="text-slate-500">
                          Frequency: ~{step.transitDetails.frequencyMinutes}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Active State Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onSelectRoute(recommendedRoute.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedRouteId === recommendedRoute.id
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            {selectedRouteId === recommendedRoute.id ? '✓ Viewing on Map' : 'Show on Map'}
          </button>

          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified student timetable sync
          </span>
        </div>
      </div>

      {/* 2. Alternative Route Cards Below for Comparison */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Alternative Route Options for Comparison
          </h4>
          <span className="text-[11px] text-slate-500">Select any card to preview path</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alternativeRoutes.map((alt, idx) => {
            const isSelected = selectedRouteId === alt.id;
            const isAltDelayed = alt.id.includes('delayed') || alt.id.includes('disrupted');

            return (
              <div
                key={alt.id}
                id={`card-alt-route-${idx + 1}`}
                onClick={() => onSelectRoute(alt.id)}
                className={`rounded-xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : isAltDelayed
                    ? 'bg-red-50/30 border-red-200 hover:border-red-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Option #{idx + 2}
                    </span>
                    {isAltDelayed ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        DELAY RISK
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">
                        {alt.comfortScore >= 8.5 ? 'High Comfort' : 'Standard'}
                      </span>
                    )}
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 leading-snug">
                    {alt.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {alt.tagline}
                  </p>

                  {/* Metrics Comparison */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 rounded p-1.5">
                      <div className="text-[10px] text-slate-500">Time</div>
                      <div className={`text-xs font-bold ${isAltDelayed ? 'text-red-600' : 'text-slate-800'}`}>
                        {alt.totalDurationMinutes}m
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded p-1.5">
                      <div className="text-[10px] text-slate-500">Cost</div>
                      <div className="text-xs font-bold text-slate-800">
                        ₹{alt.totalCostRs}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded p-1.5">
                      <div className="text-[10px] text-slate-500">Comfort</div>
                      <div className="text-xs font-bold text-slate-800">
                        {alt.comfortScore}/10
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {isSelected ? '✓ Showing on Map' : 'Click to preview'}
                  </span>
                  <div className="flex items-center gap-1">
                    {alt.transitModes.map((m, mIdx) => (
                      <span key={mIdx} className="opacity-75">{renderModeIcon(m, "w-3 h-3")}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Incident Reporting Action Card & Button */}
      <div className="rounded-xl border border-dashed border-red-300 bg-red-50/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-red-900">
              Facing Live Commute Delays on Ground?
            </h5>
            <p className="text-[11px] text-red-700">
              Report issues like "No Autos at Station" or "Train Delayed" to update classmates & adapt AI routing in real time.
            </p>
          </div>
        </div>

        <button
          id="btn-open-incident-modal"
          type="button"
          onClick={onOpenIncidentModal}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Transit Incident</span>
        </button>
      </div>
    </div>
  );
};
