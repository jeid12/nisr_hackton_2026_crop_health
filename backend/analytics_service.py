import os
import pandas as pd
from typing import List, Dict, Any

DATA_PATH = os.path.join("data", "crophealth_unified_nisr_2026.csv")

class AnalyticsService:
    def __init__(self):
        self.df = None
        self._load_data()

    def _load_data(self):
        if os.path.exists(DATA_PATH):
            try:
                self.df = pd.read_csv(DATA_PATH)
                self.df["timestamp"] = pd.to_datetime(self.df["timestamp"])
                print(f"[AnalyticsService] Telemetry records loaded: {len(self.df)}")
            except Exception as e:
                print(f"[AnalyticsService] Error reading data: {e}")
                self.df = None
        else:
            print(f"[AnalyticsService] Notice: {DATA_PATH} not found. Running with empty historical telemetry.")

    def get_recent_trends(self, window_hours: int = 72, sector: str = "Rwaza") -> List[Dict[str, Any]]:
        if self.df is None or len(self.df) == 0:
            return []

        stratum = 1 if sector.lower() == "rwaza" else 0
        filtered = self.df[self.df["stratum_type"] == stratum].tail(window_hours)

        results = []
        for _, row in filtered.iterrows():
            results.append({
                "timestamp": row["timestamp"].strftime("%Y-%m-%d %H:%M"),
                "temp_c": round(float(row["temp_c"]), 1),
                "humidity_pct": round(float(row["humidity_pct"]), 1),
                "leaf_wetness_pct": round(float(row["leaf_wetness_norm"]) * 100.0, 1),
                "soil_moisture_pct": round(float(row["soil_moisture_pct"]), 1),
                "precipitation_mm": round(float(row["precipitation_mm"]), 2),
                "late_blight_risk": round(float(row["cumulative_risk_24h"]), 2),
                "outbreak_warning_label": int(row["outbreak_warning_label"])
            })
        return results

    def get_nisr_benchmarks(self) -> Dict[str, Any]:
        """Official NISR Seasonal Agricultural Survey (SAS) 2026 Season A Baselines"""
        return {
            "source": "National Institute of Statistics of Rwanda (NISR) SAS 2026 Season A",
            "pesticide_adoption": {
                "musanze_district_pct": 74.11,
                "national_average_pct": 46.90,
                "musanze_plots_treated_pct": 59.91,
                "musanze_treated_land_pct": 62.76
            },
            "fungicide_distribution_musanze": [
                {"chemical": "Rocket (Broad/Insecticide)", "share_pct": 34.57},
                {"chemical": "Dithane / Mancozeb (Late Blight Protectant)", "share_pct": 28.89},
                {"chemical": "Cypermethrin", "share_pct": 14.32},
                {"chemical": "Ridomil / Metalaxyl (Systemic Curative)", "share_pct": 3.21},
                {"chemical": "Dimethoate", "share_pct": 8.15},
                {"chemical": "Others", "share_pct": 10.86}
            ],
            "crop_footprint_musanze_ha": {
                "irish_potatoes": 4978.37,
                "vegetables_tomatoes": 837.36,
                "maize": 5855.34,
                "climbing_beans": 8823.54
            },
            "land_strata_segments": {
                "hillside_crop_segments": 3111,
                "wetland_crop_segments": 126
            }
        }

    def get_feature_importances(self) -> List[Dict[str, Any]]:
        """Trained Random Forest Feature Rankings"""
        return [
            {
                "feature": "Foliar Wetness Duration (Past 12h)",
                "importance_pct": 34.1,
                "biological_significance": "Physical liquid water film on foliage required for zoospore penetration"
            },
            {
                "feature": "High Humidity Hours (RH >= 85%)",
                "importance_pct": 12.3,
                "biological_significance": "Prevents sporangia desiccation and enables germination"
            },
            {
                "feature": "Volumetric Soil Moisture (%)",
                "importance_pct": 10.6,
                "biological_significance": "Micro-capillary evapotranspiration sustains canopy boundary mist"
            },
            {
                "feature": "Rolling 12h Humidity Mean (%)",
                "importance_pct": 10.2,
                "biological_significance": "Sustained micro-climate moisture index"
            },
            {
                "feature": "Instantaneous Leaf Wetness",
                "importance_pct": 8.1,
                "biological_significance": "Active surface moisture presence"
            },
            {
                "feature": "Instantaneous Relative Humidity",
                "importance_pct": 6.4,
                "biological_significance": "Ambient air saturation"
            },
            {
                "feature": "Nocturnal Temperature Drop (Min 12h)",
                "importance_pct": 5.6,
                "biological_significance": "Captures night chill triggering dew condensation"
            },
            {
                "feature": "Rolling 12h Temperature Mean",
                "importance_pct": 4.8,
                "biological_significance": "Thermal stability within the 10°C–22°C window"
            },
            {
                "feature": "Precipitation (mm/h)",
                "importance_pct": 3.9,
                "biological_significance": "Replenishment of foliar film and spore distribution"
            },
            {
                "feature": "Instantaneous Temperature (°C)",
                "importance_pct": 3.5,
                "biological_significance": "Gaussian proximity to 18.0°C incubation optimum"
            },
            {
                "feature": "Agro-Ecological Stratum (NISR SAS)",
                "importance_pct": 0.5,
                "biological_significance": "Valley-bottom marshland fog vs hillside drainage"
            }
        ]

analytics_engine = AnalyticsService()
