import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Wind, 
  AlertOctagon, 
  Sparkles, 
  ChevronDown,
  Clock,
  Car,
  Train
} from 'lucide-react';
import { ORIGIN_OPTIONS, DESTINATION_OPTIONS } from '../data/commuteData';
import { CommutePreference, DisruptionState } from '../types';

interface InputPanelProps {
  originId: string;
  setOriginId: (id: string) => void;
  destinationId: string;
  setDestinationId: (id: string) => void;
  preference: CommutePreference;
  setPreference: (pref: CommutePreference) => void;
  disruptions: DisruptionState;
  setDisruptions: React.Dispatch<React.SetStateAction<DisruptionState>>;
  onGenerateRoute: () => void;
  isGenerating: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  originId,
  setOriginId,
  destinationId,
  setDestinationId,
  preference,
  setPreference,
  disruptions,
  setDisruptions,
  onGenerateRoute,
  isGenerating,
}) => {
  const [customOrigin, setCustomOrigin] = useState('');
  const [showCustomOrigin, setShowCustomOrigin] = useState(false);

  // Popular preset origins
  const presetOrigins = ['mulund', 'thane', 'kurla', 'chembur', 'ghatkopar', 'dadar'];

  const handleToggleDisruptions = () => {
    setDisruptions(prev => ({
      ...prev,
      active: !prev.active,
      centralLineDelay: !prev.active,
      autoShortageChembur: !prev.active,
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          Plan Student Commute
        </h2>
        <span className="text-[11px] text-slate-500 font-medium">Mumbai Suburban Transit</span>
      </div>

      {/* 1. Starting Location */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="origin-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            Starting Location (Origin)
          </label>
          <button
            type="button"
            onClick={() => setShowCustomOrigin(!showCustomOrigin)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
          >
            {showCustomOrigin ? 'Choose from Presets' : '+ Type Custom Area'}
          </button>
        </div>

        {showCustomOrigin ? (
          <div className="relative">
            <input
              id="custom-origin-input"
              type="text"
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              placeholder="e.g., Mulund Colony, Vashi Sector 17, Tilak Nagar"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Quick-select pills */}
            <div className="flex flex-wrap gap-1.5">
              {presetOrigins.map(pId => {
                const opt = ORIGIN_OPTIONS.find(o => o.id === pId);
                if (!opt) return null;
                const isSelected = originId === pId;
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => setOriginId(pId)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.shortName}
                  </button>
                );
              })}
            </div>

            {/* Dropdown for all origins */}
            <div className="relative">
              <select
                id="origin-select"
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
              >
                {ORIGIN_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Destination (College) */}
      <div className="space-y-1.5">
        <label htmlFor="destination-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-600" />
          Destination College / Campus
        </label>
        <div className="relative">
          <select
            id="destination-select"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
          >
            {DESTINATION_OPTIONS.map(dest => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <span className="font-semibold text-slate-700">Target:</span> Shah & Anchor Kutchhi Engineering College (SAKEC), Chembur East
        </p>
      </div>

      {/* 3. Commute Preference Toggle */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          Commute Preference Mode
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-lg border border-slate-200/80">
          <button
            id="pref-fastest-btn"
            type="button"
            onClick={() => setPreference('fastest')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              preference === 'fastest'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${preference === 'fastest' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Fastest Route</span>
          </button>
          <button
            id="pref-comfort-btn"
            type="button"
            onClick={() => setPreference('comfort')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              preference === 'comfort'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className={`w-3.5 h-3.5 ${preference === 'comfort' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Comfort / AC</span>
          </button>
        </div>
      </div>

      {/* 4. Live Transit Disruption Toggle */}
      <div className={`p-3 rounded-xl border transition-all ${
        disruptions.active 
          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              disruptions.active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Simulate Live Disruptions
                {disruptions.active && (
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600">
                Simulate real-time Mumbai transit choke points
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-disruptions-input"
              type="checkbox"
              checked={disruptions.active}
              onChange={handleToggleDisruptions}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {/* Breakdown of simulated incidents */}
        {disruptions.active && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="flex items-start gap-1.5">
              <Train className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span><b>Central Line:</b> Signal failure at Kurla/Vidyavihar switch (+28m delay)</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span><b>Chembur Station:</b> Severe auto shortage; 100+ student queue at East stand</span>
            </div>
            <div className="mt-1.5 bg-white/80 p-1.5 rounded text-[11px] text-emerald-800 font-medium border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>AI auto-switches to Metro 1 + BEST AC Express detour!</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Primary CTA: Generate AI Smart Route */}
      <button
        id="btn-generate-route"
        type="button"
        onClick={onGenerateRoute}
        disabled={isGenerating}
        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Analyzing Real-Time Corridors...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Generate AI Smart Route</span>
          </>
        )}
      </button>
    </div>
  );
};
