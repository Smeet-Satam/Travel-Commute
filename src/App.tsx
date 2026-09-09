import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { RouteResults } from './components/RouteResults';
import { CommuteMap } from './components/CommuteMap';
import { IncidentModal } from './components/IncidentModal';
import { calculateCommuteRoutes, INITIAL_INCIDENTS } from './data/commuteData';
import { CommutePreference, DisruptionState, IncidentReport } from './types';

export default function App() {
  // Commute state
  const [originId, setOriginId] = useState<string>('mulund');
  const [destinationId, setDestinationId] = useState<string>('sakec_chembur');
  const [preference, setPreference] = useState<CommutePreference>('fastest');
  const [disruptions, setDisruptions] = useState<DisruptionState>({
    active: false,
    centralLineDelay: false,
    autoShortageChembur: false,
    waterloggingKurla: false,
  });

  // UI state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // Calculate routes reactively
  const routesData = useMemo(() => {
    return calculateCommuteRoutes(originId, destinationId, preference, disruptions);
  }, [originId, destinationId, preference, disruptions]);

  // Sync selectedRouteId with recommended whenever options or disruptions change
  const currentActiveRouteId = selectedRouteId || routesData.recommended.id;

  const handleGenerateRoute = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedRouteId(routesData.recommended.id);
    }, 400);
  };

  const handleAddIncident = (newIncident: IncidentReport) => {
    setIncidents(prev => [newIncident, ...prev]);

    // If report mentions auto shortage or train delay, auto-activate simulated disruptions
    if (newIncident.type === 'no_autos' || newIncident.type === 'train_delayed') {
      setDisruptions(prev => ({
        ...prev,
        active: true,
        centralLineDelay: newIncident.type === 'train_delayed' ? true : prev.centralLineDelay,
        autoShortageChembur: newIncident.type === 'no_autos' ? true : prev.autoShortageChembur,
      }));
    }
  };

  const handleUpvoteIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* 1. Header */}
      <Header
        disruptionsActive={disruptions.active}
        incidentCount={incidents.length}
        onOpenIncidentsModal={() => setIsIncidentModalOpen(true)}
      />

      {/* 2. Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel & Route Results (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Input Panel */}
            <InputPanel
              originId={originId}
              setOriginId={(id) => {
                setOriginId(id);
                setSelectedRouteId('');
              }}
              destinationId={destinationId}
              setDestinationId={(id) => {
                setDestinationId(id);
                setSelectedRouteId('');
              }}
              preference={preference}
              setPreference={(pref) => {
                setPreference(pref);
                setSelectedRouteId('');
              }}
              disruptions={disruptions}
              setDisruptions={(d) => {
                setDisruptions(d);
                setSelectedRouteId('');
              }}
              onGenerateRoute={handleGenerateRoute}
              isGenerating={isGenerating}
            />

            {/* Route Results Section */}
            <RouteResults
              recommendedRoute={routesData.recommended}
              alternativeRoutes={routesData.alternatives}
              selectedRouteId={currentActiveRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
              disruptionsActive={disruptions.active}
            />
          </div>

          {/* Right Column: Interactive Map Panel (5 cols on lg, sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Transit Map
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    OpenStreetMap • Mumbai Suburban Corridor
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {disruptions.active ? 'Detour Plotted' : 'Optimal Path'}
                  </span>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="h-[460px] sm:h-[560px] lg:h-[620px] w-full">
                <CommuteMap
                  recommendedRoute={routesData.recommended}
                  alternativeRoutes={routesData.alternatives}
                  selectedRouteId={currentActiveRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  incidents={incidents}
                  disruptionsActive={disruptions.active}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Incident Reporting Modal */}
      <IncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        incidents={incidents}
        onAddIncident={handleAddIncident}
        onUpvoteIncident={handleUpvoteIncident}
      />
    </div>
  );
}
