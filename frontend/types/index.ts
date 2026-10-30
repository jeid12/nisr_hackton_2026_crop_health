export interface DiseaseRiskDetail {
  probability: number;
  risk_tier: 'SAFE' | 'PREVENTIVE' | 'EMERGENCY' | 'ACTIVE' | 'MODERATE';
  status_color: 'green' | 'amber' | 'red';
  action_protocol: string;
}

export interface SimulationResponse {
  status: string;
  late_blight: DiseaseRiskDetail;
  early_blight: DiseaseRiskDetail;
  biological_diagnosis: string;
  kinyarwanda_sms: string;
  stratum_applied: string;
}

export interface TelemetryTrendPoint {
  timestamp: string;
  temp_c: number;
  humidity_pct: number;
  leaf_wetness_pct: number;
  soil_moisture_pct: number;
  precipitation_mm: number;
  late_blight_risk: number;
  outbreak_warning_label: number;
}

export interface TrendResponse {
  sector: string;
  window_hours: number;
  data: TelemetryTrendPoint[];
}

export interface FeatureImportanceItem {
  feature: string;
  importance_pct: number;
  biological_significance: string;
}

export interface NISRBenchmarks {
  source: string;
  pesticide_adoption: {
    musanze_district_pct: number;
    national_average_pct: number;
    musanze_plots_treated_pct: number;
    musanze_treated_land_pct: number;
  };
  fungicide_distribution_musanze: Array<{
    chemical: string;
    share_pct: number;
  }>;
  crop_footprint_musanze_ha: {
    irish_potatoes: number;
    vegetables_tomatoes: number;
    maize: number;
    climbing_beans: number;
  };
  land_strata_segments: {
    hillside_crop_segments: number;
    wetland_crop_segments: number;
  };
}
