import { CommuteRoute, IncidentReport, CommutePreference, DisruptionState, TransitMode, RouteStep } from '../types';

export interface LocationOption {
  id: string;
  name: string;
  shortName: string;
  coordinates: [number, number];
  category: 'station' | 'hub' | 'college';
}

export const ORIGIN_OPTIONS: LocationOption[] = [
  { id: 'thane', name: 'Thane Railway Station (West/East)', shortName: 'Thane', coordinates: [19.1860, 72.9759], category: 'station' },
  { id: 'kurla', name: 'Kurla Station / Nehru Nagar', shortName: 'Kurla', coordinates: [19.0657, 72.8793], category: 'station' },
  { id: 'chembur', name: 'Chembur Station / Monorail', shortName: 'Chembur', coordinates: [19.0622, 72.8977], category: 'station' },
  { id: 'ghatkopar', name: 'Ghatkopar Railway & Metro Station', shortName: 'Ghatkopar', coordinates: [19.0860, 72.9080], category: 'station' },
  { id: 'dadar', name: 'Dadar Central / Western Junction', shortName: 'Dadar', coordinates: [19.0178, 72.8478], category: 'station' },
  { id: 'mulund', name: 'Mulund Station (Central Suburbs)', shortName: 'Mulund', coordinates: [19.1726, 72.9563], category: 'station' },
  { id: 'vashi', name: 'Vashi Station Plaza (Navi Mumbai)', shortName: 'Vashi', coordinates: [19.0771, 72.9986], category: 'station' },
  { id: 'andheri', name: 'Andheri Metro / Railway Station', shortName: 'Andheri', coordinates: [19.1197, 72.8468], category: 'station' },
];

export const DESTINATION_OPTIONS: LocationOption[] = [
  {
    id: 'sakec_chembur',
    name: 'Shah & Anchor Kutchhi Engineering College, Chembur',
    shortName: 'SAKEC Chembur',
    coordinates: [19.0478, 72.9090],
    category: 'college'
  },
  {
    id: 'somaiya_vidyavihar',
    name: 'K.J. Somaiya College of Engineering, Vidyavihar',
    shortName: 'Somaiya Vidyavihar',
    coordinates: [19.0728, 72.9005],
    category: 'college'
  },
  {
    id: 'vjti_matunga',
    name: 'Veermata Jijabai Technological Institute (VJTI), Matunga',
    shortName: 'VJTI Matunga',
    coordinates: [19.0222, 72.8561],
    category: 'college'
  },
  {
    id: 'vesit_chembur',
    name: 'VESIT - Vivekanand Education Society, Chembur',
    shortName: 'VESIT Chembur',
    coordinates: [19.0450, 72.8890],
    category: 'college'
  },
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-1',
    type: 'train_delayed',
    location: 'Central Line - Kurla & Vidyavihar track switch',
    coordinates: [19.0685, 72.8845],
    description: 'Signal failure near Kurla pf #4. All CSMT/Dadar down fast locals delayed by 20-30 mins.',
    timestamp: '12 mins ago',
    reportedBy: 'Kunal S. (Student CR)',
    verified: true,
    upvotes: 42,
  },
  {
    id: 'inc-2',
    type: 'no_autos',
    location: 'Chembur Railway Station East (Auto Stand)',
    coordinates: [19.0620, 72.8995],
    description: 'Huge 100+ student queue for share-autos towards SAKEC/Deonar. Drivers refusing meter trips.',
    timestamp: '18 mins ago',
    reportedBy: 'Pooja M. (SAKEC IT Dept)',
    verified: true,
    upvotes: 29,
  },
  {
    id: 'inc-3',
    type: 'waterlogging',
    location: 'Sion Circle & Kurla Depot Underpass',
    coordinates: [19.0392, 72.8621],
    description: 'Slow-moving traffic due to water accumulation. BEST buses running 15 mins behind schedule.',
    timestamp: '35 mins ago',
    reportedBy: 'Rahul V. (VESIT Comps)',
    verified: false,
    upvotes: 14,
  },
];

// Helper to calculate distance
function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Generate intelligent routes tailored to the selections
export function calculateCommuteRoutes(
  originId: string,
  destId: string,
  preference: CommutePreference,
  disruptions: DisruptionState
): {
  recommended: CommuteRoute;
  alternatives: CommuteRoute[];
} {
  const origin = ORIGIN_OPTIONS.find(o => o.id === originId) || ORIGIN_OPTIONS[0];
  const dest = DESTINATION_OPTIONS.find(d => d.id === destId) || DESTINATION_OPTIONS[0];

  const origCoord = origin.coordinates;
  const destCoord = dest.coordinates;

  // Key Mumbai transit landmark coordinates
  const ghatkoparCoord: [number, number] = [19.0860, 72.9080];
  const kurlaCoord: [number, number] = [19.0657, 72.8793];
  const tilakNagarCoord: [number, number] = [19.0645, 72.8895];
  const chemburStnCoord: [number, number] = [19.0622, 72.8977];
  const easternFreewayCoord: [number, number] = [19.0560, 72.9150];
  const chemburNakaCoord: [number, number] = [19.0545, 72.9015];
  const vidyaviharCoord: [number, number] = [19.0728, 72.9005];
  const matungaCoord: [number, number] = [19.0222, 72.8561];

  const isChemburCollege = dest.id === 'sakec_chembur' || dest.id === 'vesit_chembur';
  const isSomaiya = dest.id === 'somaiya_vidyavihar';
  const isVjti = dest.id === 'vjti_matunga';
  const isCentralLineOrigin = ['mulund', 'thane', 'ghatkopar', 'dadar'].includes(origin.id);
  const isHarbourOrigin = origin.id === 'vashi';
  const isKurlaOrigin = origin.id === 'kurla';
  const isChemburOrigin = origin.id === 'chembur';

  // ==========================================
  // SCENARIO 1: Disrupted Transit State Active
  // ==========================================
  if (disruptions.active) {
    // When disruptions are active: Central Line is stalled at Kurla & Chembur auto stand is congested.
    // AI Recommended Detour: Metro 1 / BEST AC Bus #355 bypass via Eastern Express & Ghatkopar
    const recommendedRoute: CommuteRoute = {
      id: 'ai-smart-detour',
      title: 'AI Smart Detour: Metro 1 + Electric AC Bus #355',
      tagline: 'Completely bypasses Kurla signal breakdown & Chembur station auto chaos',
      totalDurationMinutes: preference === 'fastest' ? 36 : 40,
      totalCostRs: 28,
      comfortScore: 8.9,
      isRecommended: true,
      isDisruptionDetour: true,
      transitModes: ['walk', 'metro', 'bus', 'walk'],
      aiReasoning: `🚨 Central Line signal failure at Kurla (+28m delay) & massive queue at Chembur Station East auto stand detected. The standard route (Central Local to Kurla, FOB transfer to Harbour Line local towards Panvel, and Chembur share-auto) is heavily paralyzed today. The AI rerouted you via Ghatkopar Metro 1 and BEST Electric AC Bus #355 along the Eastern Express corridor, dropping you directly at the ${dest.shortName} gate. Saves ~32 minutes and avoids crowded interchanges.`,
      pathCoordinates: [
        origCoord,
        [origCoord[0] - 0.02, origCoord[1] - 0.01],
        ghatkoparCoord,
        [19.0720, 72.9120],
        easternFreewayCoord,
        chemburNakaCoord,
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: `${origin.name} (Station Platform)`, type: 'origin', mode: 'walk' },
        { lat: ghatkoparCoord[0], lng: ghatkoparCoord[1], name: 'Ghatkopar Interchange (Metro 1 / BEST Depot)', type: 'transfer', mode: 'metro', note: 'Switch to AC Bus #355 (Runs every 7 mins)' },
        { lat: chemburNakaCoord[0], lng: chemburNakaCoord[1], name: 'Chembur Naka / SAKEC Chowk', type: 'transfer', mode: 'bus', note: 'Direct drop near college gate' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination', mode: 'walk' },
      ],
      steps: [
        {
          id: 'step-detour-1',
          mode: 'walk',
          instruction: `Walk 4 mins from ${origin.shortName} to elevated feeder / Metro platform`,
          durationMinutes: 4,
          distanceKm: 0.3,
        },
        {
          id: 'step-detour-2',
          mode: 'metro',
          instruction: `Board Metro / Elevated Feeder Line to Ghatkopar Transit Hub`,
          durationMinutes: 14,
          distanceKm: 7.2,
          transitDetails: {
            lineOrNumber: 'Metro Line 1 / Feeder',
            fromStop: origin.shortName,
            toStop: 'Ghatkopar Hub',
            fareRs: 15,
            crowdLevel: 'Medium',
            isAC: true,
            frequencyMinutes: 5,
          }
        },
        {
          id: 'step-detour-3',
          mode: 'bus',
          instruction: `Board BEST Electric AC Bus #355-LTD / #388 to Chembur Naka`,
          durationMinutes: 15,
          distanceKm: 4.8,
          transitDetails: {
            lineOrNumber: 'BEST AC #355-LTD',
            fromStop: 'Ghatkopar East Depot',
            toStop: 'Chembur Naka / SAKEC Chowk',
            fareRs: 13,
            crowdLevel: 'Low',
            isAC: true,
            frequencyMinutes: 7,
          }
        },
        {
          id: 'step-detour-4',
          mode: 'walk',
          instruction: `Walk 3 mins directly into ${dest.shortName} main campus entrance`,
          durationMinutes: 3,
          distanceKm: 0.2,
        }
      ]
    };

    const alt1: CommuteRoute = {
      id: 'alt-disrupted-local',
      title: 'Traditional Central Local + Kurla Switch + Station Auto (Severely Delayed)',
      tagline: 'Critical delay: Kurla signal jam (+28m) & 100+ student queue at Chembur auto stand',
      totalDurationMinutes: 68,
      totalCostRs: 27,
      comfortScore: 3.8,
      isRecommended: false,
      isDisruptionDetour: false,
      transitModes: ['walk', 'train', 'walk', 'train', 'auto', 'walk'],
      aiReasoning: 'Traditional student commute is crippled today: 28-minute track switch bottleneck approaching Kurla, followed by cascading delays on Harbour Line and a 45+ minute queue at Chembur Station East auto stand. Avoid this route today.',
      pathCoordinates: [
        origCoord,
        [19.1200, 72.9300],
        kurlaCoord,
        tilakNagarCoord,
        chemburStnCoord,
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: `${origin.name}`, type: 'origin', mode: 'walk' },
        { lat: kurlaCoord[0], lng: kurlaCoord[1], name: 'Kurla Junction (Signal Failure +28m delay)', type: 'hazard', note: 'Central Line train bottleneck' },
        { lat: chemburStnCoord[0], lng: chemburStnCoord[1], name: 'Chembur Station East Auto Stand', type: 'hazard', note: 'Student auto queue > 45 mins' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination', mode: 'walk' },
      ],
      steps: [
        {
          id: 'step-alt1-1',
          mode: 'walk',
          instruction: `Walk to ${origin.shortName} Platform (Delayed)`,
          durationMinutes: 4,
          distanceKm: 0.3,
        },
        {
          id: 'step-alt1-2',
          mode: 'train',
          instruction: 'Central Railway Local towards CSMT (Severe delay +28 mins approaching Kurla)',
          durationMinutes: 46,
          distanceKm: 14.5,
          transitDetails: {
            lineOrNumber: 'Central Line Local',
            fromStop: origin.shortName,
            toStop: 'Kurla Junction',
            fareRs: 10,
            crowdLevel: 'Crush Load',
            isAC: false,
            frequencyMinutes: 20,
          }
        },
        {
          id: 'step-alt1-3',
          mode: 'walk',
          instruction: 'Alight at Kurla & push through overcrowded FOB to Platform #7/#8',
          durationMinutes: 5,
          distanceKm: 0.15,
        },
        {
          id: 'step-alt1-4',
          mode: 'train',
          instruction: 'Harbour Line Local towards Panvel (Irregular & delayed departure)',
          durationMinutes: 12,
          distanceKm: 3.4,
          transitDetails: {
            lineOrNumber: 'Harbour Line (towards Panvel)',
            fromStop: 'Kurla Platform 7/8',
            toStop: 'Chembur Railway Station',
            fareRs: 5,
            crowdLevel: 'Crush Load',
            isAC: false,
            frequencyMinutes: 15,
          }
        },
        {
          id: 'step-alt1-5',
          mode: 'auto',
          instruction: 'Wait in massive 100+ student queue for Share-Auto at Chembur Station East',
          durationMinutes: 24,
          distanceKm: 2.2,
          transitDetails: {
            lineOrNumber: 'Chembur East Share-Auto Stand',
            fromStop: 'Chembur Station East',
            toStop: dest.shortName,
            fareRs: 12,
            crowdLevel: 'Crush Load',
            isAC: false,
          }
        },
        {
          id: 'step-alt1-6',
          mode: 'walk',
          instruction: `Walk into ${dest.shortName}`,
          durationMinutes: 2,
          distanceKm: 0.1,
        }
      ]
    };

    const alt2: CommuteRoute = {
      id: 'alt-freeway-cab',
      title: 'Shared Student Auto / Freeway Shuttle',
      tagline: 'Direct road transit along Eastern Express, higher cost shared among students',
      totalDurationMinutes: 42,
      totalCostRs: 85,
      comfortScore: 8.0,
      isRecommended: false,
      isDisruptionDetour: false,
      transitModes: ['auto'],
      aiReasoning: 'Bypasses all railway disruptions by taking the Eastern Express Highway / Freeway. Clean travel with breeze or AC, but costs ₹85 even when split 3 ways.',
      pathCoordinates: [
        origCoord,
        [19.1400, 72.9500],
        [19.0950, 72.9250],
        easternFreewayCoord,
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin', mode: 'auto' },
        { lat: easternFreewayCoord[0], lng: easternFreewayCoord[1], name: 'Eastern Freeway Chembur Exit', type: 'transfer', mode: 'auto' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' },
      ],
      steps: [
        {
          id: 'step-alt2-1',
          mode: 'auto',
          instruction: `Share-Cab/Auto pooled from ${origin.shortName} along EE Highway directly to ${dest.shortName}`,
          durationMinutes: 42,
          distanceKm: 15.2,
          transitDetails: {
            lineOrNumber: 'Shared Student Cab/Auto',
            fareRs: 85,
            crowdLevel: 'Low',
            isAC: false,
          }
        }
      ]
    };

    return {
      recommended: recommendedRoute,
      alternatives: [alt1, alt2]
    };
  }

  // ==========================================
  // SCENARIO 2: Normal Operating Conditions
  // ==========================================

  // Preference: Comfort / AC
  if (preference === 'comfort') {
    const recommendedComfort: CommuteRoute = {
      id: 'ai-comfort-route',
      title: 'Central AC Local + BEST AC Electric Bus #355',
      tagline: '100% Air-Conditioned comfort with cushioned seating & zero sweat',
      totalDurationMinutes: 38,
      totalCostRs: 45,
      comfortScore: 9.3,
      isRecommended: true,
      transitModes: ['walk', 'train', 'bus', 'walk'],
      aiReasoning: `Selected based on "Maximum Comfort / AC" preference. Takes the Central Railway AC Fast Local with chilled air conditioning and guaranteed cushioned seats, transferring seamlessly at Ghatkopar to BEST AC Electric feeder #355. Avoids the humid crush-load of non-AC compartments.`,
      pathCoordinates: [
        origCoord,
        [19.1400, 72.9400],
        ghatkoparCoord,
        chemburNakaCoord,
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: `${origin.name} (AC Ticket Counter)`, type: 'origin', mode: 'walk' },
        { lat: ghatkoparCoord[0], lng: ghatkoparCoord[1], name: 'Ghatkopar Junction (AC Local Plat 4)', type: 'transfer', mode: 'train', note: 'AC Local Coach #4' },
        { lat: chemburNakaCoord[0], lng: chemburNakaCoord[1], name: 'Chembur Naka AC Bus Stop', type: 'transfer', mode: 'bus', note: 'BEST Electric AC #355' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination', mode: 'walk' },
      ],
      steps: [
        {
          id: 'step-c-1',
          mode: 'walk',
          instruction: `Walk 4 mins to ${origin.shortName} AC ticket counter / Platform`,
          durationMinutes: 4,
          distanceKm: 0.3,
        },
        {
          id: 'step-c-2',
          mode: 'train',
          instruction: 'Board Central Railway AC Fast Local (Clean & Air-Conditioned)',
          durationMinutes: 19,
          distanceKm: 12.0,
          transitDetails: {
            lineOrNumber: 'Central AC Fast Local (CSMT Bound)',
            fromStop: origin.shortName,
            toStop: 'Ghatkopar Junction',
            fareRs: 35,
            crowdLevel: 'Low',
            isAC: true,
            frequencyMinutes: 15,
          }
        },
        {
          id: 'step-c-3',
          mode: 'bus',
          instruction: 'Board BEST Electric AC Bus #355-LTD from Ghatkopar Depot',
          durationMinutes: 12,
          distanceKm: 3.8,
          transitDetails: {
            lineOrNumber: 'BEST AC #355-LTD',
            fromStop: 'Ghatkopar Depot East',
            toStop: 'Chembur Naka / SAKEC Chowk',
            fareRs: 10,
            crowdLevel: 'Low',
            isAC: true,
            frequencyMinutes: 8,
          }
        },
        {
          id: 'step-c-4',
          mode: 'walk',
          instruction: `Walk 3 mins directly into ${dest.shortName} campus gate`,
          durationMinutes: 3,
          distanceKm: 0.2,
        }
      ]
    };

    // Alt 1 for Comfort: Fast Local + Harbour Line (towards Panvel) + Auto
    const altFastNormal: CommuteRoute = {
      id: 'alt-regular-fast',
      title: 'Central Local + Harbour Line (towards Panvel) + Share-Auto',
      tagline: 'Standard suburban commute (36 mins) via Kurla Interchange',
      totalDurationMinutes: 36,
      totalCostRs: 27,
      comfortScore: 6.8,
      isRecommended: false,
      transitModes: ['walk', 'train', 'walk', 'train', 'auto', 'walk'],
      aiReasoning: `Saves ₹18 compared to AC route and runs every 4 minutes. Requires transferring at Kurla from Central Railway to Harbour Line Platform 7/8 for the local towards Panvel to reach Chembur Station.`,
      pathCoordinates: [
        origCoord,
        [19.1200, 72.9300],
        kurlaCoord,
        tilakNagarCoord,
        chemburStnCoord,
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin', mode: 'walk' },
        { lat: kurlaCoord[0], lng: kurlaCoord[1], name: 'Kurla Junction Interchange', type: 'transfer', mode: 'train', note: 'FOB to Plat 7/8 for Panvel Local' },
        { lat: chemburStnCoord[0], lng: chemburStnCoord[1], name: 'Chembur Station East', type: 'transfer', mode: 'auto', note: 'Share-Auto Stand to College' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination', mode: 'walk' },
      ],
      steps: [
        {
          id: 'step-cf-1',
          mode: 'walk',
          instruction: `Walk to ${origin.shortName} Platform (CSMT Bound)`,
          durationMinutes: 3,
          distanceKm: 0.2,
        },
        {
          id: 'step-cf-2',
          mode: 'train',
          instruction: 'Central Railway Local towards CSMT / Dadar (Deboard at Kurla)',
          durationMinutes: 18,
          distanceKm: 13.5,
          transitDetails: {
            lineOrNumber: 'Central Line Local',
            fromStop: origin.shortName,
            toStop: 'Kurla Junction',
            fareRs: 10,
            crowdLevel: 'High',
            isAC: false,
            frequencyMinutes: 4,
          }
        },
        {
          id: 'step-cf-3',
          mode: 'walk',
          instruction: 'Alight at Kurla & cross Foot Overbridge to Platform #7/#8 (Harbour Line)',
          durationMinutes: 3,
          distanceKm: 0.15,
        },
        {
          id: 'step-cf-4',
          mode: 'train',
          instruction: 'Board Harbour Line Local train towards Panvel / Belapur (Deboard at Chembur)',
          durationMinutes: 6,
          distanceKm: 3.4,
          transitDetails: {
            lineOrNumber: 'Harbour Line (towards Panvel)',
            fromStop: 'Kurla Platform 7/8',
            toStop: 'Chembur Railway Station',
            fareRs: 5,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 5,
          }
        },
        {
          id: 'step-cf-5',
          mode: 'auto',
          instruction: `Share-Auto from Chembur Station East to ${dest.shortName}`,
          durationMinutes: 8,
          distanceKm: 2.2,
          transitDetails: {
            lineOrNumber: 'Chembur East Share-Auto Stand',
            fromStop: 'Chembur Station East',
            toStop: dest.shortName,
            fareRs: 12,
            crowdLevel: 'Medium',
            isAC: false,
          }
        },
        {
          id: 'step-cf-6',
          mode: 'walk',
          instruction: `Walk into ${dest.shortName} campus`,
          durationMinutes: 1,
          distanceKm: 0.1,
        }
      ]
    };

    const altMetroFeeder: CommuteRoute = {
      id: 'alt-metro-feeder',
      title: 'Metro Blue Line 1 + AC Feeder Shuttle',
      tagline: 'Reliable elevated transit across Ghatkopar & Chembur Link Road',
      totalDurationMinutes: 44,
      totalCostRs: 40,
      comfortScore: 8.9,
      isRecommended: false,
      transitModes: ['metro', 'bus', 'walk'],
      aiReasoning: 'Consistent timings immune to rain or road jams. Air-conditioned elevated train and feeder bus.',
      pathCoordinates: [
        origCoord,
        ghatkoparCoord,
        [19.0700, 72.9050],
        destCoord,
      ],
      waypoints: [
        { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin' },
        { lat: ghatkoparCoord[0], lng: ghatkoparCoord[1], name: 'Ghatkopar Metro Station', type: 'transfer', mode: 'metro' },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' },
      ],
      steps: [
        {
          id: 'step-cm-1',
          mode: 'metro',
          instruction: 'Mumbai Metro Line 1',
          durationMinutes: 24,
          distanceKm: 8.5,
          transitDetails: {
            lineOrNumber: 'Metro Line 1',
            fareRs: 30,
            crowdLevel: 'Medium',
            isAC: true,
          }
        },
        {
          id: 'step-cm-2',
          mode: 'bus',
          instruction: 'AC Feeder to College Stop',
          durationMinutes: 20,
          distanceKm: 4.2,
          transitDetails: {
            lineOrNumber: 'BEST AC 388',
            fareRs: 10,
            crowdLevel: 'Low',
            isAC: true,
          }
        }
      ]
    };

    return {
      recommended: recommendedComfort,
      alternatives: [altFastNormal, altMetroFeeder]
    };
  }

  // ==========================================
  // SCENARIO 3: Fastest Route (Default Preference)
  // ==========================================

  // Build accurate, authentic step sequence tailored to the exact Origin -> Destination
  let fastestTitle = 'Central Local + Harbour Line (towards Panvel) + Chembur Share-Auto';
  let fastestTagline = 'Fastest commute corridor via Kurla Interchange to Chembur (36 mins)';
  let fastestModes: TransitMode[] = ['walk', 'train', 'walk', 'train', 'auto', 'walk'];
  let fastestReasoning = `Optimal speed selection! Central Railway Local takes ~18 mins from ${origin.shortName} to Kurla Junction. At Kurla, deboard and take the foot overbridge to Platform 7/8, then board the Harbour Line local train towards Panvel/Belapur to Chembur Station (6 mins). Exit Chembur East where share-autos run every 2 minutes directly to ${dest.shortName}. Total time is only 36 mins.`;
  let fastestSteps: RouteStep[] = [];
  let fastestWaypoints = [];
  let fastestPath: [number, number][] = [];

  if (isChemburCollege) {
    // Route from Central Suburbs (Mulund, Thane, Bhandup, Ghatkopar, Dadar) to SAKEC Chembur / VESIT
    if (isCentralLineOrigin) {
      fastestTitle = 'Central Local + Harbour Local (towards Panvel) + Chembur Share-Auto';
      fastestTagline = `Fastest route from ${origin.shortName} to ${dest.shortName} via Kurla Interchange (36 mins)`;
      fastestModes = ['walk', 'train', 'walk', 'train', 'auto', 'walk'];
      fastestReasoning = `Optimal route verified! Board Central Railway local from ${origin.shortName} to Kurla Junction (Platform 1-4). Deboard at Kurla and take the Foot Overbridge (FOB) across to Platform 7/8 to board the Harbour Line local train towards Panvel/Belapur. Deboard at Chembur Railway Station, exit via the East Overbridge, and take a frequent share-auto directly to the ${dest.shortName} gate. This saves 15 minutes over road buses and costs only ₹27 total.`;

      fastestSteps = [
        {
          id: 'step-f-1',
          mode: 'walk',
          instruction: `Walk 3 mins to ${origin.shortName} Railway Station (Platform #1/#3 - CSMT / Dadar Bound)`,
          durationMinutes: 3,
          distanceKm: 0.2,
        },
        {
          id: 'step-f-2',
          mode: 'train',
          instruction: `Board Central Line Local train (Fast/Slow towards CSMT / Dadar)`,
          durationMinutes: 18,
          distanceKm: 13.5,
          transitDetails: {
            lineOrNumber: 'Central Line Local (CSMT Bound)',
            fromStop: `${origin.shortName} Station`,
            toStop: 'Kurla Junction',
            fareRs: 10,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 4,
          }
        },
        {
          id: 'step-f-3',
          mode: 'walk',
          instruction: 'Alight / deboard at Kurla Junction & cross Foot Overbridge (FOB) to Platform #7 / #8 (Harbour Line)',
          durationMinutes: 3,
          distanceKm: 0.15,
        },
        {
          id: 'step-f-4',
          mode: 'train',
          instruction: 'Board Harbour Line Local train towards Panvel / Belapur (Deboard at Chembur Station)',
          durationMinutes: 6,
          distanceKm: 3.4,
          transitDetails: {
            lineOrNumber: 'Harbour Line (Local towards Panvel/Belapur)',
            fromStop: 'Kurla Platform #7/#8',
            toStop: 'Chembur Railway Station',
            fareRs: 5,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 5,
          }
        },
        {
          id: 'step-f-5',
          mode: 'walk',
          instruction: 'Alight at Chembur Station (Platform 1/2) and exit via East Foot Overbridge towards Auto Stand (Dr. Choitram Gidwani Rd)',
          durationMinutes: 2,
          distanceKm: 0.1,
        },
        {
          id: 'step-f-6',
          mode: 'auto',
          instruction: `Board Share-Auto from Chembur Station East directly to ${dest.shortName} (Mahavir Education Trust Chowk)`,
          durationMinutes: 8,
          distanceKm: 2.2,
          transitDetails: {
            lineOrNumber: 'Chembur East Share-Auto Stand',
            fromStop: 'Chembur Station East',
            toStop: `${dest.shortName} Gate`,
            fareRs: 12,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 2,
          }
        },
        {
          id: 'step-f-7',
          mode: 'walk',
          instruction: `Walk 1 min directly into ${dest.shortName} main campus entrance & lecture hall complex`,
          durationMinutes: 1,
          distanceKm: 0.1,
        }
      ];

      fastestWaypoints = [
        { 
          lat: origCoord[0], 
          lng: origCoord[1], 
          name: `${origin.name} (Platform #1/#3)`, 
          type: 'origin' as const, 
          mode: 'walk' as TransitMode 
        },
        { 
          lat: kurlaCoord[0], 
          lng: kurlaCoord[1], 
          name: 'Kurla Junction Interchange', 
          type: 'transfer' as const, 
          mode: 'train' as TransitMode,
          note: 'Alight Central Local & take FOB to Platform 7/8 for Local towards Panvel' 
        },
        { 
          lat: chemburStnCoord[0], 
          lng: chemburStnCoord[1], 
          name: 'Chembur Railway Station East', 
          type: 'transfer' as const, 
          mode: 'auto' as TransitMode,
          note: 'Deboard Harbour Local & exit East Overbridge to SAKEC Share-Auto Stand' 
        },
        { 
          lat: destCoord[0], 
          lng: destCoord[1], 
          name: dest.name, 
          type: 'destination' as const, 
          mode: 'walk' as TransitMode,
          note: 'Mahavir Education Trust Chowk, Chembur' 
        },
      ];

      fastestPath = [
        origCoord,
        [19.1530, 72.9460], // Bhandup
        [19.1120, 72.9280], // Vikhroli
        ghatkoparCoord,
        kurlaCoord,         // Kurla Central to Harbour junction
        tilakNagarCoord,    // Tilak Nagar on Harbour line towards Panvel
        chemburStnCoord,    // Chembur station
        [19.0550, 72.9030], // Diamond Garden / Chembur East Auto route
        destCoord,          // College
      ];
    } else if (isHarbourOrigin) {
      // From Vashi (already on Harbour Line)
      fastestTitle = 'Direct Harbour Line Local (CSMT Bound) + Chembur Share-Auto';
      fastestTagline = `Direct harbour line train from ${origin.shortName} to Chembur Station (24 mins)`;
      fastestModes = ['walk', 'train', 'auto', 'walk'];
      fastestReasoning = `Direct Harbour Line local train towards CSMT/Vadala runs every 4 minutes from Vashi, reaching Chembur Station in just 14 mins. Exit Chembur East for a quick 8-min share-auto to ${dest.shortName}.`;

      fastestSteps = [
        {
          id: 'step-f-v1',
          mode: 'walk',
          instruction: `Walk 3 mins to Vashi Station Platform (CSMT Bound)`,
          durationMinutes: 3,
          distanceKm: 0.2,
        },
        {
          id: 'step-f-v2',
          mode: 'train',
          instruction: 'Board Harbour Line Local train towards CSMT / Vadala',
          durationMinutes: 14,
          distanceKm: 9.8,
          transitDetails: {
            lineOrNumber: 'Harbour Line (CSMT Bound)',
            fromStop: 'Vashi Station',
            toStop: 'Chembur Railway Station',
            fareRs: 10,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 4,
          }
        },
        {
          id: 'step-f-v3',
          mode: 'auto',
          instruction: `Share-Auto from Chembur Station East to ${dest.shortName}`,
          durationMinutes: 8,
          distanceKm: 2.2,
          transitDetails: {
            lineOrNumber: 'Chembur East Share-Auto Stand',
            fromStop: 'Chembur Stn East',
            toStop: dest.shortName,
            fareRs: 12,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 2,
          }
        },
        {
          id: 'step-f-v4',
          mode: 'walk',
          instruction: `Walk 1 min directly into ${dest.shortName}`,
          durationMinutes: 1,
          distanceKm: 0.1,
        }
      ];

      fastestWaypoints = [
        { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin' as const, mode: 'walk' as TransitMode },
        { lat: chemburStnCoord[0], lng: chemburStnCoord[1], name: 'Chembur Station East', type: 'transfer' as const, mode: 'auto' as TransitMode },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' as const, mode: 'walk' as TransitMode },
      ];

      fastestPath = [
        origCoord,
        [19.0680, 72.9300], // Mankhurd
        [19.0650, 72.9150], // Govandi
        chemburStnCoord,
        destCoord,
      ];
    } else {
      // Default Kurla / Chembur / Andheri origin to Chembur college
      fastestTitle = 'Harbour Local (towards Panvel) + Chembur Station Share-Auto';
      fastestTagline = `Fastest connection via Chembur Station corridor (22 mins)`;
      fastestModes = ['train', 'auto', 'walk'];
      fastestReasoning = `Board Harbour Line Local train towards Panvel/Belapur to Chembur Station, followed by share-auto directly to ${dest.shortName}.`;

      fastestSteps = [
        {
          id: 'step-f-k1',
          mode: 'train',
          instruction: 'Board Harbour Line Local train towards Panvel / Belapur (Platform 7/8)',
          durationMinutes: 6,
          distanceKm: 3.4,
          transitDetails: {
            lineOrNumber: 'Harbour Line (towards Panvel)',
            fromStop: 'Kurla Station',
            toStop: 'Chembur Railway Station',
            fareRs: 5,
            crowdLevel: 'Medium',
            isAC: false,
            frequencyMinutes: 4,
          }
        },
        {
          id: 'step-f-k2',
          mode: 'auto',
          instruction: `Share-Auto from Chembur Station East to ${dest.shortName}`,
          durationMinutes: 8,
          distanceKm: 2.2,
          transitDetails: {
            lineOrNumber: 'Chembur East Share-Auto Stand',
            fromStop: 'Chembur Stn East',
            toStop: dest.shortName,
            fareRs: 12,
            crowdLevel: 'Medium',
            isAC: false,
          }
        },
        {
          id: 'step-f-k3',
          mode: 'walk',
          instruction: `Walk into ${dest.shortName}`,
          durationMinutes: 1,
          distanceKm: 0.1,
        }
      ];

      fastestWaypoints = [
        { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin' as const },
        { lat: chemburStnCoord[0], lng: chemburStnCoord[1], name: 'Chembur Railway Station East', type: 'transfer' as const, mode: 'auto' as TransitMode },
        { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' as const },
      ];

      fastestPath = [
        origCoord,
        chemburStnCoord,
        destCoord,
      ];
    }
  } else {
    // Non-Chembur destinations (e.g. Somaiya Vidyavihar or VJTI Matunga on Central Line)
    fastestTitle = `Direct Central Railway Local to ${dest.shortName}`;
    fastestTagline = `Direct railway connectivity without Harbour transfer (26 mins)`;
    fastestModes = ['walk', 'train', 'walk'];
    fastestReasoning = `${dest.shortName} is directly situated along the Central Railway Main corridor. Take the Central Local directly to the station and walk to campus.`;

    fastestSteps = [
      {
        id: 'step-f-o1',
        mode: 'walk',
        instruction: `Walk to ${origin.shortName} Platform`,
        durationMinutes: 3,
        distanceKm: 0.2,
      },
      {
        id: 'step-f-o2',
        mode: 'train',
        instruction: `Central Railway Local towards CSMT / Dadar`,
        durationMinutes: isSomaiya ? 14 : 24,
        distanceKm: isSomaiya ? 9.5 : 16.0,
        transitDetails: {
          lineOrNumber: 'Central Line Local',
          fromStop: origin.shortName,
          toStop: isSomaiya ? 'Vidyavihar Station' : 'Matunga Station',
          fareRs: 10,
          crowdLevel: 'Medium',
          isAC: false,
          frequencyMinutes: 4,
        }
      },
      {
        id: 'step-f-o3',
        mode: 'walk',
        instruction: `Walk 6 mins from station exit to ${dest.shortName} campus gate`,
        durationMinutes: 6,
        distanceKm: 0.5,
      }
    ];

    fastestWaypoints = [
      { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin' as const, mode: 'walk' as TransitMode },
      { lat: isSomaiya ? vidyaviharCoord[0] : matungaCoord[0], lng: isSomaiya ? vidyaviharCoord[1] : matungaCoord[1], name: isSomaiya ? 'Vidyavihar Station' : 'Matunga Station', type: 'transfer' as const, mode: 'train' as TransitMode },
      { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' as const, mode: 'walk' as TransitMode },
    ];

    fastestPath = [
      origCoord,
      isSomaiya ? vidyaviharCoord : matungaCoord,
      destCoord,
    ];
  }

  const recommendedFastest: CommuteRoute = {
    id: 'ai-fastest-route',
    title: fastestTitle,
    tagline: fastestTagline,
    totalDurationMinutes: 36,
    totalCostRs: 27,
    comfortScore: 7.4,
    isRecommended: true,
    transitModes: fastestModes,
    aiReasoning: fastestReasoning,
    pathCoordinates: fastestPath,
    waypoints: fastestWaypoints,
    steps: fastestSteps,
  };

  // Alternative 1: Direct BEST Bus
  const altBusDirect: CommuteRoute = {
    id: 'alt-bus-direct',
    title: 'Direct BEST Bus #355-LTD / #375 to Chembur Naka',
    tagline: 'No station transfers or train rush, single boarding convenience',
    totalDurationMinutes: 48,
    totalCostRs: 15,
    comfortScore: 7.8,
    isRecommended: false,
    transitModes: ['walk', 'bus', 'walk'],
    aiReasoning: 'Most economical option at only ₹15. Single direct seat without changing trains at Kurla, but vulnerable to highway traffic lights at Bhandup and Vikhroli.',
    pathCoordinates: [
      origCoord,
      [19.1450, 72.9500],
      [19.1000, 72.9300],
      easternFreewayCoord,
      chemburNakaCoord,
      destCoord,
    ],
    waypoints: [
      { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin', mode: 'walk' },
      { lat: easternFreewayCoord[0], lng: easternFreewayCoord[1], name: 'Eastern Express Link Corridor', type: 'transfer', mode: 'bus' },
      { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination', mode: 'walk' },
    ],
    steps: [
      {
        id: 'step-b-1',
        mode: 'bus',
        instruction: 'Board BEST Bus #355-LTD / #375 towards Chembur / Trombay',
        durationMinutes: 44,
        distanceKm: 14.8,
        transitDetails: {
          lineOrNumber: 'BEST #355-LTD',
          fareRs: 15,
          crowdLevel: 'Medium',
          isAC: false,
          frequencyMinutes: 12,
        }
      },
      {
        id: 'step-b-2',
        mode: 'walk',
        instruction: `Walk 4 mins from Chembur Naka stop into ${dest.shortName}`,
        durationMinutes: 4,
        distanceKm: 0.3,
      }
    ]
  };

  // Alternative 2: AC Local + AC Bus
  const altAcExpress: CommuteRoute = {
    id: 'alt-ac-express',
    title: 'AC Fast Local + BEST AC Electric Bus #355',
    tagline: 'Higher comfort with 100% AC transit throughout the commute',
    totalDurationMinutes: 38,
    totalCostRs: 45,
    comfortScore: 9.1,
    isRecommended: false,
    transitModes: ['train', 'bus', 'walk'],
    aiReasoning: 'Chilled air-conditioned experience with guaranteed seating and zero humidity, but costs ₹18 more than the standard local + auto combo.',
    pathCoordinates: [
      origCoord,
      ghatkoparCoord,
      chemburNakaCoord,
      destCoord,
    ],
    waypoints: [
      { lat: origCoord[0], lng: origCoord[1], name: origin.name, type: 'origin' },
      { lat: ghatkoparCoord[0], lng: ghatkoparCoord[1], name: 'Ghatkopar AC Plat 4', type: 'transfer', mode: 'train' },
      { lat: destCoord[0], lng: destCoord[1], name: dest.name, type: 'destination' },
    ],
    steps: [
      {
        id: 'step-ac-1',
        mode: 'train',
        instruction: 'Central Railway AC Fast Local to Ghatkopar Interchange',
        durationMinutes: 19,
        distanceKm: 12.0,
        transitDetails: {
          lineOrNumber: 'Central AC Fast Local',
          fareRs: 35,
          crowdLevel: 'Low',
          isAC: true,
        }
      },
      {
        id: 'step-ac-2',
        mode: 'bus',
        instruction: 'BEST AC 355-LTD directly to Chembur Naka / SAKEC Chowk',
        durationMinutes: 15,
        distanceKm: 4.2,
        transitDetails: {
          lineOrNumber: 'BEST AC 355',
          fareRs: 10,
          crowdLevel: 'Low',
          isAC: true,
        }
      },
      {
        id: 'step-ac-3',
        mode: 'walk',
        instruction: `Walk 3 mins to ${dest.shortName}`,
        durationMinutes: 3,
        distanceKm: 0.2,
      }
    ]
  };

  return {
    recommended: recommendedFastest,
    alternatives: [altBusDirect, altAcExpress]
  };
}
