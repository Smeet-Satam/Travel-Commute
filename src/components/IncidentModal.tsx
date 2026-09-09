import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ThumbsUp, 
  Send, 
  ShieldCheck, 
  Clock, 
  MapPin,
  Train,
  Car
} from 'lucide-react';
import { IncidentReport } from '../types';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: IncidentReport[];
  onAddIncident: (newIncident: IncidentReport) => void;
  onUpvoteIncident: (id: string) => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  incidents,
  onAddIncident,
  onUpvoteIncident,
}) => {
  const [incidentType, setIncidentType] = useState<IncidentReport['type']>('no_autos');
  const [location, setLocation] = useState('Chembur Station East Auto Stand');
  const [description, setDescription] = useState('');
  const [isVerifiedStudent, setIsVerifiedStudent] = useState(true);
  const [studentCollege, setStudentCollege] = useState('Shah & Anchor Kutchhi Engineering College (SAKEC)');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Approximate coords based on location choice
    let coords: [number, number] = [19.0622, 72.8977];
    if (location.toLowerCase().includes('kurla')) {
      coords = [19.0657, 72.8793];
    } else if (location.toLowerCase().includes('sion')) {
      coords = [19.0392, 72.8621];
    } else if (location.toLowerCase().includes('ghatkopar')) {
      coords = [19.0860, 72.9080];
    } else if (location.toLowerCase().includes('sakec') || location.toLowerCase().includes('chembur')) {
      coords = [19.0520, 72.9020];
    }

    const newReport: IncidentReport = {
      id: `inc-${Date.now()}`,
      type: incidentType,
      location: location,
      coordinates: coords,
      description: description.trim(),
      timestamp: 'Just now',
      reportedBy: isVerifiedStudent ? `Verified Student (${studentCollege.split(' ')[0]})` : 'Anonymous Student',
      verified: isVerifiedStudent,
      upvotes: 1,
    };

    onAddIncident(newReport);
    setDescription('');
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="incident-reporting-modal"
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Student Transit Incident Hub
              </h3>
              <p className="text-xs text-slate-500">
                Flag disruptions to trigger real-time AI re-routing for peers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6">
          {successNotice ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <div className="font-bold text-base">Incident Reported Successfully!</div>
              <p className="text-xs text-emerald-700">
                Your report is now live on the map. AI Smart Route will dynamically avoid this bottleneck!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Incident Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('no_autos');
                      setLocation('Chembur Station East Auto Stand');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      incidentType === 'no_autos'
                        ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400/40 text-amber-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">No Autos Available</div>
                      <div className="text-[10px] text-slate-500 font-normal">Huge queue / drivers refusing</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIncidentType('train_delayed');
                      setLocation('Central Line - Kurla / Vidyavihar Switch');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      incidentType === 'train_delayed'
                        ? 'bg-red-50 border-red-400 ring-1 ring-red-400/40 text-red-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Train className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">Train Delayed / Signal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Signal jam / mega block</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Location / Station Hub
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Chembur Station East Auto Stand, Kurla Pf 4"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Incident Details & Severity
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Massive 150-student queue outside station. Wait time over 35 mins. Share-autos refusing fixed student rates."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                ></textarea>
              </div>

              {/* Student Verification Option */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">
                      Student Verification Status
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerifiedStudent}
                      onChange={(e) => setIsVerifiedStudent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {isVerifiedStudent ? (
                  <div className="text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>Tag report as <b>Verified Student Commuter</b></span>
                    <span className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      HIGH TRUST
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500">
                    Will be posted as unverified community report
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Live Incident to Network</span>
              </button>
            </form>
          )}

          {/* Active Live Alerts Feed */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Active Verified Reports in Mumbai Area</span>
              <span className="text-[10px] text-slate-500 font-normal">Real-time crowdsourced</span>
            </h4>

            <div className="space-y-2.5">
              {incidents.map((inc) => (
                <div 
                  key={inc.id}
                  className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3 border border-slate-200 text-xs transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900">
                        {inc.location}
                      </span>
                      {inc.verified && (
                        <span className="bg-emerald-100 text-emerald-800 font-semibold text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {inc.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{inc.timestamp}</span>
                      <span>•</span>
                      <span>{inc.reportedBy}</span>
                    </div>
                  </div>

                  {/* Upvote */}
                  <button
                    type="button"
                    onClick={() => onUpvoteIncident(inc.id)}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                    title="Confirm / Upvote this incident"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-semibold text-[11px]">{inc.upvotes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
