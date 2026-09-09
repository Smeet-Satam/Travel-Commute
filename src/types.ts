export type TransitMode = 'train' | 'metro' | 'bus' | 'auto' | 'walk';

export interface RouteStep {
  id: string;
  mode: TransitMode;
  instruction: string;
  durationMinutes: number;
  distanceKm: number;
  transitDetails?: {
    lineOrNumber?: string;
    fromStop?: string;
    toStop?: string;
    fareRs?: number;
    crowdLevel?: 'Low' | 'Medium' | 'High' | 'Crush Load';
    isAC?: boolean;
    frequencyMinutes?: number;
  };
}

export interface CommuteRoute {
  id: string;
  title: string;
  tagline: string;
  totalDurationMinutes: number;
  totalCostRs: number;
  comfortScore: number; // 1 to 10
  isRecommended: boolean;
  isDisruptionDetour?: boolean;
  transitModes: TransitMode[];
  steps: RouteStep[];
  aiReasoning: string;
  pathCoordinates: [number, number][]; // [lat, lng] array
  waypoints: {
    lat: number;
    lng: number;
    name: string;
    type: 'origin' | 'transfer' | 'destination' | 'hazard';
    mode?: TransitMode;
    note?: string;
  }[];
}

export type CommutePreference = 'fastest' | 'comfort';

export interface DisruptionState {
  active: boolean;
  centralLineDelay: boolean;
  autoShortageChembur: boolean;
  waterloggingKurla: boolean;
  customDescription?: string;
}

export interface IncidentReport {
  id: string;
  type: 'no_autos' | 'train_delayed' | 'overcrowded_station' | 'metro_glitch' | 'waterlogging';
  location: string;
  coordinates: [number, number];
  description: string;
  timestamp: string;
  reportedBy: string;
  verified: boolean;
  upvotes: number;
}
