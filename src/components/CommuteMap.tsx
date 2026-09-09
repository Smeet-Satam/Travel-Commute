import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CommuteRoute, IncidentReport } from '../types';

interface CommuteMapProps {
  recommendedRoute: CommuteRoute;
  alternativeRoutes: CommuteRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  incidents: IncidentReport[];
  disruptionsActive: boolean;
}

export const CommuteMap: React.FC<CommuteMapProps> = ({
  recommendedRoute,
  alternativeRoutes,
  selectedRouteId,
  onSelectRoute,
  incidents,
  disruptionsActive,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Mumbai approx coordinates
    const map = L.map(mapContainerRef.current, {
      center: [19.0760, 72.8777],
      zoom: 12,
      zoomControl: false,
    });

    // Add modern OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update polylines and markers whenever routes, selected route, or incidents change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    const allRoutes = [recommendedRoute, ...alternativeRoutes];
    const activeRoute = allRoutes.find(r => r.id === selectedRouteId) || recommendedRoute;

    // 1. Draw alternative routes first (behind recommended)
    alternativeRoutes.forEach(altRoute => {
      const isCurrentlyActive = altRoute.id === selectedRouteId;
      const isAltDisrupted = altRoute.id.includes('delayed') || altRoute.id.includes('disrupted');

      const color = isCurrentlyActive 
        ? '#2563eb' 
        : (isAltDisrupted ? '#ef4444' : '#94a3b8');

      const polyline = L.polyline(altRoute.pathCoordinates, {
        color: color,
        weight: isCurrentlyActive ? 5 : 4,
        opacity: isCurrentlyActive ? 0.9 : 0.65,
        dashArray: isCurrentlyActive ? undefined : '6, 8',
      });

      polyline.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <b style="color: ${color};">${altRoute.title}</b><br/>
          <span>Time: <b>${altRoute.totalDurationMinutes} mins</b> | Fare: ₹${altRoute.totalCostRs}</span><br/>
          <span style="color: #64748b; font-size: 11px;">${altRoute.tagline}</span>
        </div>
      `);

      polyline.on('click', () => {
        onSelectRoute(altRoute.id);
      });

      layersGroup.addLayer(polyline);
    });

    // 2. Draw Recommended route prominently
    const isRecActive = recommendedRoute.id === selectedRouteId;
    const recColor = '#16a34a'; // Vibrant Green for recommended AI route

    // Shadow line for depth
    const recGlow = L.polyline(recommendedRoute.pathCoordinates, {
      color: '#86efac',
      weight: isRecActive ? 9 : 7,
      opacity: 0.5,
    });
    layersGroup.addLayer(recGlow);

    const recPolyline = L.polyline(recommendedRoute.pathCoordinates, {
      color: recColor,
      weight: isRecActive ? 6 : 5,
      opacity: 0.95,
    });

    recPolyline.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
        <span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">
          ★ AI RECOMMENDED ROUTE
        </span>
        <div style="font-weight: 700; color: #16a34a; margin-top: 4px;">${recommendedRoute.title}</div>
        <div>Time: <b>${recommendedRoute.totalDurationMinutes} mins</b> | Cost: <b>₹${recommendedRoute.totalCostRs}</b></div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px;">${recommendedRoute.tagline}</div>
      </div>
    `);

    recPolyline.on('click', () => {
      onSelectRoute(recommendedRoute.id);
    });

    layersGroup.addLayer(recPolyline);

    // 3. Add Custom Markers for Active Route Waypoints
    activeRoute.waypoints.forEach((wp, idx) => {
      let iconHtml = '';
      let markerColor = '#2563eb';

      if (wp.type === 'origin') {
        markerColor = '#16a34a';
        iconHtml = `
          <div style="
            background: #16a34a;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          ">A</div>
        `;
      } else if (wp.type === 'destination') {
        markerColor = '#7c3aed';
        iconHtml = `
          <div style="
            background: #7c3aed;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(124, 58, 237, 0.4);
          ">🎓</div>
        `;
      } else if (wp.type === 'hazard') {
        iconHtml = `
          <div style="
            background: #dc2626;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.25);
          ">⚠️</div>
        `;
      } else {
        // Transfer point
        iconHtml = `
          <div style="
            background: #2563eb;
            color: white;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          ">⇄</div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-commute-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: ${markerColor};">
            ${wp.type.toUpperCase()}
          </span>
          <div style="font-weight: 700; color: #0f172a; margin: 2px 0;">${wp.name}</div>
          ${wp.note ? `<div style="color: #475569; font-size: 11px; margin-top: 2px;">${wp.note}</div>` : ''}
        </div>
      `);

      layersGroup.addLayer(marker);
    });

    // 4. If disruptions are active, add incident markers on the map
    if (disruptionsActive && incidents.length > 0) {
      incidents.forEach(inc => {
        const incIcon = L.divIcon({
          className: 'incident-marker',
          html: `
            <div style="
              background: #ef4444;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              border: 2px solid white;
              box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.3);
            ">🚨</div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        const incMarker = L.marker(inc.coordinates, { icon: incIcon });
        incMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; max-width: 200px;">
            <div style="color: #b91c1c; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              <span>🚨 Live Incident Report</span>
              ${inc.verified ? '<span style="background: #fee2e2; color: #991b1b; padding: 1px 4px; border-radius: 4px; font-size: 9px;">VERIFIED</span>' : ''}
            </div>
            <div style="font-weight: 600; color: #1e293b; margin-top: 4px;">${inc.location}</div>
            <div style="color: #475569; font-size: 11px; margin-top: 2px;">${inc.description}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Reported ${inc.timestamp} by ${inc.reportedBy}</div>
          </div>
        `);

        layersGroup.addLayer(incMarker);
      });
    }

    // Auto-fit bounds with safe padding
    try {
      const bounds = L.latLngBounds(activeRoute.pathCoordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } catch {
      // Fallback
    }
  }, [recommendedRoute, alternativeRoutes, selectedRouteId, incidents, disruptionsActive, onSelectRoute]);

  const handleResetToMumbai = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.0760, 72.8777], 12);
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current && recommendedRoute.pathCoordinates.length > 0) {
      const bounds = L.latLngBounds(recommendedRoute.pathCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Map canvas */}
      <div id="leaflet-commute-map" ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Floating map controls */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
        <button
          id="btn-center-mumbai"
          onClick={handleResetToMumbai}
          className="bg-white/95 hover:bg-white text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 backdrop-blur-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset to Mumbai Central Overview"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
          Center Mumbai
        </button>
        <button
          id="btn-fit-route"
          onClick={handleFitRoute}
          className="bg-white/95 hover:bg-white text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 backdrop-blur-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Zoom to Fit Route Path"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
          Fit Active Route
        </button>
      </div>

      {/* Map Legend Floating Bottom Right */}
      <div className="absolute bottom-3 right-3 z-30 bg-white/95 backdrop-blur-md p-2.5 rounded-lg shadow-md border border-slate-200/90 text-xs text-slate-700 space-y-1.5 max-w-[210px]">
        <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
          <span>Map Routes & Points</span>
          {disruptionsActive && (
            <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded text-[10px]">LIVE</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 rounded bg-emerald-600 inline-block shadow-sm"></span>
          <span className="text-[11px] font-medium text-slate-800">Recommended Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded border-t-2 border-dashed border-blue-500 inline-block"></span>
          <span className="text-[11px] text-slate-600">Alternative Commute</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">🎓</span>
          <span className="text-[11px] text-slate-700">College Campus</span>
        </div>
        {disruptionsActive && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">⚠️</span>
            <span className="text-[11px] text-red-700 font-medium">Transit Delay / Hazard</span>
          </div>
        )}
      </div>
    </div>
  );
};
