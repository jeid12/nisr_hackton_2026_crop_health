import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

MODEL_PATH = os.path.join("models", "crophealth_dual_rf_model.pkl")

class MLService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print(f"[MLService] Model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"[MLService] Failed to load model: {e}")
                self.model = None
        else:
            print(f"[MLService] Warning: {MODEL_PATH} not found. Run training script.")

    def predict(
        self,
        temp_c: float,
        humidity_pct: float,
        leaf_wetness_norm: float,
        soil_moisture_pct: float,
        stratum_type: int = 1,
        wetness_duration_12h: float = None
    ) -> Dict[str, Any]:
        high_hum = 10.0 if humidity_pct >= 85.0 else (2.0 if humidity_pct >= 75.0 else 0.0)
        wet_dur = wetness_duration_12h if wetness_duration_12h is not None else (
            9.0 if leaf_wetness_norm >= 0.5 else (2.0 if leaf_wetness_norm > 0.1 else 0.0)
        )
        soil_sat = 10.0 if soil_moisture_pct >= 65.0 else 0.0
        precip = 2.5 if leaf_wetness_norm >= 0.9 else 0.0

        # Feature vector matching training columns
        input_features = pd.DataFrame([{
            'temp_c': temp_c,
            'humidity_pct': humidity_pct,
            'leaf_wetness_norm': leaf_wetness_norm,
            'soil_moisture_pct': soil_moisture_pct,
            'soil_moisture_rolling_mean_12h': soil_moisture_pct,
            'soil_saturated_hours_12h': soil_sat,
            'temp_rolling_mean_12h': temp_c,
            'temp_rolling_min_12h': max(temp_c - 2.5, 10.0),
            'humidity_rolling_mean_12h': humidity_pct,
            'high_hum_hours_12h': high_hum,
            'wetness_duration_12h': wet_dur,
            'precipitation_mm': precip,
            'stratum_type': stratum_type,
            'nisr_pesticide_adoption_rate': 0.7411 # Musanze SAS 2026 baseline
        }])

        if self.model is not None:
            probs = self.model.predict_proba(input_features)
            p_lb = float(probs[0][0][1]) * 100.0
            p_eb = float(probs[1][0][1]) * 100.0
        else:
            # Algorithmic fallback if model file hasn't been compiled
            t_aff_lb = np.exp(-((temp_c - 18.0) ** 2) / 50.0)
            m_aff_lb = min(1.0, max(leaf_wetness_norm, max(0.0, (humidity_pct - 85.0) / 15.0)))
            p_lb = float(t_aff_lb * m_aff_lb * (1.0 + 0.15 * stratum_type)) * 100.0

            t_aff_eb = np.exp(-((temp_c - 24.5) ** 2) / 45.0)
            m_aff_eb = min(1.0, max(leaf_wetness_norm, max(0.0, (humidity_pct - 75.0) / 25.0)))
            p_eb = float(t_aff_eb * m_aff_eb * (1.0 + 0.15 * (1 - stratum_type))) * 100.0

        # Late Blight Tiering
        if p_lb >= 75.0:
            lb_tier = "EMERGENCY"
            lb_color = "red"
            lb_action = "Immediate systemic curative fungicide (e.g., Ridomil/Metalaxyl) required."
        elif p_lb >= 45.0:
            lb_tier = "PREVENTIVE"
            lb_color = "amber"
            lb_action = "Apply contact protective surface barrier (e.g., Mancozeb/Dithane) before incubation ends."
        else:
            lb_tier = "SAFE"
            lb_color = "green"
            lb_action = "Safe state: Skip spraying to protect soil microbiome and save chemical costs."

        # Early Blight Tiering
        if p_eb >= 60.0:
            eb_tier = "ACTIVE"
            eb_color = "red"
            eb_action = "Apply Early Blight targeted protectant (Copper Oxychloride / Dithane)."
        elif p_eb >= 35.0:
            eb_tier = "MODERATE"
            eb_color = "amber"
            eb_action = "Monitor lower canopy foliage for dark concentric ring lesions."
        else:
            eb_tier = "SAFE"
            eb_color = "green"
            eb_action = "No intervention necessary."

        # Biological Summary
        if p_lb >= 75.0 and p_eb >= 60.0:
            diagnosis = "DUAL OUTBREAK CRITICAL: Thermal and moisture vectors trigger severe Late Blight and Early Blight."
        elif p_lb >= 75.0:
            diagnosis = "LATE BLIGHT EPIDEMIC RISK: High foliar saturation and cool canopy temperatures favor Phytophthora infestans."
        elif p_eb >= 60.0:
            diagnosis = "EARLY BLIGHT PROLIFERATION: Warm humid boundary layers accelerate Alternaria solani conidia germination."
        elif p_lb >= 45.0 or p_eb >= 35.0:
            diagnosis = "PREVENTIVE THRESHOLD BREACHED: Sub-pathogenic incubation active. Proactive intervention recommended."
        else:
            diagnosis = "HOSTILE AGRO-CLIMATE: Low humidity and dry foliar surface prohibit fungal sporulation."

        return {
            "late_blight": {
                "probability": round(p_lb, 1),
                "risk_tier": lb_tier,
                "status_color": lb_color,
                "action_protocol": lb_action
            },
            "early_blight": {
                "probability": round(p_eb, 1),
                "risk_tier": eb_tier,
                "status_color": eb_color,
                "action_protocol": eb_action
            },
            "biological_diagnosis": diagnosis,
            "stratum_applied": "Rwaza Sector (Mukungwa Wetland)" if stratum_type == 1 else "Nkotsi Sector (Volcanic Hillside)"
        }

ml_engine = MLService()
