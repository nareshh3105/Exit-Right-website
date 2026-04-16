export type Station = {
  id: string;
  name: string;
  city: string;
  line_code: string;
  latitude: number;
  longitude: number;
  popularity_index: number;
};

export type ExitGate = {
  id: string;
  station_id: string;
  gate_code: string;
  gate_name: string;
  latitude: number;
  longitude: number;
  road_type: string;
  lighting_score: number;
};

export type TransportOption = {
  mode: "walking" | "shared_auto" | "bus" | "cab";
  estimated_travel_time_min: number;
  estimated_cost_inr: number;
  distance_km: number;
  crowd_indicator: "LOW" | "MEDIUM" | "HIGH";
  weather_indicator: string;
  safety_score: number;
  confidence_score: number;
  final_score: number;
};

export type RecommendationResponse = {
  station_id: string;
  station_name: string;
  best_exit: {
    exit_gate_id: string;
    gate_code: string;
    gate_name: string;
    distance_km: number;
  };
  recommended_mode: TransportOption["mode"];
  transport_ranking: TransportOption[];
  adaptive_weights: Record<string, number>;
  context: Record<string, string | number>;
};

export type CabOption = {
  provider: "Uber" | "Ola" | "Rapido" | "Namma Yatri";
  estimated_price_inr: number;
  eta_min: number;
  deep_link: string;
  fallback_link: string;
  recommended: boolean;
  cheapest: boolean;
};

export type CabComparisonResponse = {
  cheapest_provider: string;
  recommended_provider: string;
  options: CabOption[];
};

export type PlaceSuggestion = {
  name: string;
  latitude: number;
  longitude: number;
};
