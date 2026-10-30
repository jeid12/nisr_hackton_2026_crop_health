# CropHealth EWS: Dual-Disease Risk Model

**NISR 2026 Big Data Hackathon · Track 1: Agricultural Productivity Challenge**

This folder holds the trained model that powers CropHealth EWS. It predicts the outbreak probability of two potato and tomato diseases from micro-climate readings: Late Blight (*Phytophthora infestans*, *Kiniga*) and Early Blight (*Alternaria solani*). The probabilities drive the risk tiers and farmer SMS advisories in the dashboard.

---

## 1. At a glance

| | |
|---|---|
| **Model file** | `crophealth_dual_rf_model.pkl` |
| **Type** | Random Forest classifier with two outputs (one per disease) |
| **Trees / depth** | 120 trees, maximum depth 8, `random_state=42` |
| **Inputs** | 14 engineered features (section 3) |
| **Outputs** | Probability of outbreak for each disease, from 0 to 1 |
| **Training data** | `data/crophealth_unified_nisr_2026.csv`, 7,032 hourly records (Jan to Oct 2026) |
| **Validation** | Chronological 80/20 split. The test set is the final 1,407 hours. |
| **Scaling** | Not required. Tree models are not affected by feature scale. |

---

## 2. Why two outputs and why this model

Late Blight and Early Blight favour different conditions, so one model predicts both:

- **Late Blight** thrives in cool, wet conditions. The incubation optimum is about 18 °C, with relative humidity at or above 85%.
- **Early Blight** thrives in warm, humid conditions. The optimum is about 24.5 °C, with relative humidity at or above 75%.

A Random Forest was chosen for three reasons:
1. Its decisions can be explained with feature importances, which matters for agronomic review.
2. It needs no feature scaling, so raw sensor readings can be used directly.
3. It handles multiple outputs in one model, which keeps inference fast enough for a live slider.

---

## 3. Features

The model uses 14 features. Every feature is a value the model is trained on, and the live simulator builds each one from the sliders (see section 8 for the approximation).

| # | Feature | Meaning | Typical range in training data |
|---|---------|---------|-------------------------------|
| 1 | `temp_c` | Air temperature at canopy height (°C) | 10.8 to 27.9 |
| 2 | `humidity_pct` | Relative humidity (%) | 28.8 to 100 |
| 3 | `leaf_wetness_norm` | Leaf surface wetness index, 0 (dry) to 1 (film of water) | 0 to 1 |
| 4 | `soil_moisture_pct` | Root-zone volumetric soil moisture (%) | 41 to 88 |
| 5 | `soil_moisture_rolling_mean_12h` | 12-hour average soil moisture | — |
| 6 | `soil_saturated_hours_12h` | Hours in the last 12 with soil moisture at or above 65% | — |
| 7 | `temp_rolling_mean_12h` | 12-hour average temperature | — |
| 8 | `temp_rolling_min_12h` | 12-hour minimum temperature (night chill) | — |
| 9 | `humidity_rolling_mean_12h` | 12-hour average humidity | — |
| 10 | `high_hum_hours_12h` | Hours in the last 12 with humidity at or above 85% | — |
| 11 | `wetness_duration_12h` | Hours in the last 12 with leaf wetness at or above 0.5 | — |
| 12 | `precipitation_mm` | Hourly rainfall (mm), sensor flags removed | — |
| 13 | `stratum_type` | 1 = Rwaza wetland (Mukungwa), 0 = Nkotsi hillside | 0 or 1 |
| 14 | `nisr_pesticide_adoption_rate` | Musanze pesticide adoption, NISR SAS 2026 | 0.7411 (constant) |

**Data fusion.** The training set combines three sources: NISR SAS 2026 Season A tables (district chemical-use baselines), NASA POWER hourly agroclimate records for Musanze (lat -1.499, lon 29.634), and a foliar-wetness index derived from temperature, humidity, and rainfall.

---

## 4. Performance

Results are reported from the training run on the held-out test set (1,407 hours, never seen during training).

| Target | Accuracy | ROC-AUC | Recall | F1 |
|--------|----------|---------|--------|----|
| Late Blight | 96.30% | 0.9955 | 96.99% | 0.9727 |
| Early Blight | 86.28% | 0.9859 | — | 0.8765 |

**Why recall matters most.** A missed outbreak (false negative) can destroy a field. A false alarm (false positive) only triggers an inspection. For Late Blight, the model finds 96.99% of true outbreak hours, missing 29 of 964.

**Candidate comparison** (reported from the same training run, Late Blight target):

| Model | Accuracy | ROC-AUC | Recall | Notes |
|-------|----------|---------|--------|-------|
| **Random Forest (120 trees)** | **96.73%** | **0.9956** | **96.99%** | Selected |
| Logistic Regression | 96.59% | 0.9956 | 96.68% | Needs feature scaling |
| HistGradientBoosting | 96.52% | 0.9945 | 96.37% | Sensitive to sensor noise |
| Single decision tree | 85.57% | 0.8115 | 93.26% | Unstable across splits |

---

## 5. What drives the prediction

Importances below come from the saved model (`feature_importances_`, mean decrease in impurity, averaged over both outputs).

| Rank | Feature | Importance | Agronomic meaning |
|------|---------|-----------|-------------------|
| 1 | `wetness_duration_12h` | 32.1% | Continuous leaf-surface water film. Zoospores need it to penetrate the leaf. |
| 2 | `leaf_wetness_norm` | 11.1% | Current leaf wetness |
| 3 | `soil_moisture_rolling_mean_12h` | 10.5% | Waterlogged soil raises canopy humidity through evapotranspiration |
| 4 | `precipitation_mm` | 8.7% | Rain refreshes the leaf film and spreads spores |
| 5 | `soil_moisture_pct` | 7.3% | Current root-zone moisture |
| 6 | `soil_saturated_hours_12h` | 7.0% | Prolonged soil saturation |
| 7 | `high_hum_hours_12h` | 5.8% | Hours at or above 85% humidity keep sporangia viable |
| 8 | `humidity_rolling_mean_12h` | 4.6% | Sustained humidity |
| 9 | `humidity_pct` | 3.6% | Current humidity |
| 10 | `temp_rolling_mean_12h` | 3.5% | Thermal stability over 12 hours |
| 11 | `temp_rolling_min_12h` | 3.5% | Night chill that triggers dew condensation |
| 12 | `temp_c` | 2.3% | Current temperature |
| 13 | `stratum_type` | 0.2% | Wetland versus hillside |
| 14 | `nisr_pesticide_adoption_rate` | 0.0% | Constant in training, so it carries no signal |

Wetness-related features together account for most of the decision, which matches the epidemiology: no free water on the leaf means no infection.

---

## 6. Risk tiers

The backend turns probabilities into tiers and actions (`backend/ml_service.py`):

| Disease | Tier | Probability | Recommended action |
|---------|------|-------------|--------------------|
| Late Blight | EMERGENCY | 75% or higher | Systemic curative fungicide (Ridomil / metalaxyl) |
| Late Blight | PREVENTIVE | 45% to 75% | Protective contact fungicide (Mancozeb / Dithane) before the incubation window closes |
| Late Blight | SAFE | Below 45% | Skip spraying |
| Early Blight | ACTIVE | 60% or higher | Early Blight protectant (copper oxychloride or Dithane) |
| Early Blight | MODERATE | 35% to 60% | Scout the lower canopy for concentric ring lesions |
| Early Blight | SAFE | Below 35% | No action |

Advisories are written in Kinyarwanda and sent by SMS, so they reach farmers with basic feature phones.

---

## 7. Live simulator outputs

These are the outputs of the running app for the three presets (the same inputs as the dashboard buttons):

| Preset | Inputs (T, RH, leaf wetness, soil, stratum, dew hours) | Late Blight | Early Blight |
|--------|--------------------------------------------------------|-------------|--------------|
| Rwaza Marshland Mist (crisis) | 16.8 °C, 96%, 0.95, 78%, Rwaza, 10 h | 99.2% EMERGENCY | 81.3% ACTIVE |
| Nkotsi Warm-Wet Trigger | 25.2 °C, 84%, 0.70, 58%, Nkotsi, 8 h | 94.2% EMERGENCY | 39.3% MODERATE |
| Sunny Afternoon (safe) | 26.5 °C, 42%, 0.00, 42%, Nkotsi, 0 h | 15.6% SAFE | 0.1% SAFE |

---

## 8. Limitations

- **The live simulator approximates the 12-hour features.** A slider gives one reading, so the simulator builds the 12-hour features from that reading (for example, `temp_rolling_min_12h` is set to the current temperature minus 2.5 °C). Training used real 12-hour histories. The simulator outputs above are therefore indicative, not the same as offline test-set results.
- **Feature importances on the dashboard are not yet computed from this model.** The backend's feature-importance endpoint returns fixed values that differ from the table in section 5. Replacing them with the values above is the next fix.
- **Training code is not in this repository.** The model file is provided as-is. The data pipeline and training script need to be added to make the results reproducible.
- **Single-season data.** Training covers January to October 2026 in Musanze. Other seasons and districts are untested.
- **Sensor dependence.** The model assumes calibrated leaf-wetness and soil sensors. Uncalibrated sensors will shift the probabilities.

---

## 9. Using the model

```python
import joblib
import pandas as pd

model = joblib.load("models/crophealth_dual_rf_model.pkl")

# Column order must match the training order
features = list(model.feature_names_in_)

reading = {
    "temp_c": 16.8, "humidity_pct": 96, "leaf_wetness_norm": 0.95,
    "soil_moisture_pct": 78, "soil_moisture_rolling_mean_12h": 78,
    "soil_saturated_hours_12h": 10, "temp_rolling_mean_12h": 16.8,
    "temp_rolling_min_12h": 14.3, "humidity_rolling_mean_12h": 96,
    "high_hum_hours_12h": 10, "wetness_duration_12h": 10,
    "precipitation_mm": 2.5, "stratum_type": 1,
    "nisr_pesticide_adoption_rate": 0.7411,
}
X = pd.DataFrame([reading])[features]

proba = model.predict_proba(X)          # one array per disease
late_blight = proba[0][0, 1]            # probability of class 1 (outbreak)
early_blight = proba[1][0, 1]
print(f"Late Blight: {late_blight:.1%}  Early Blight: {early_blight:.1%}")
# Late Blight: 99.2%  Early Blight: 81.3%
```

Scikit-learn may print a version warning if its version differs from the one used for training (1.6.1). Predictions are unaffected.

---

## 10. Files in this folder

| File | Description |
|------|-------------|
| `crophealth_dual_rf_model.pkl` | Dual-output model used by the application |
| `crophealth_rf_baseline.pkl` | Single-output Random Forest with the same 14 features, kept as the baseline |
| `README.md` | This document |

---

## 11. Projected impact

These are projections from the proposal, not measured results from this prototype.

- **Fewer unnecessary sprays.** Skipping calendar sprays during safe periods could cut fungicide use by an estimated 35% to 50%, saving up to about 120,000 RWF per hectare per season.
- **Less chemical runoff.** Targeted application reduces metalaxyl and chlorothalonil reaching the soil and the Mukungwa River.
- **Scalable to other districts.** The approach could extend to Rubavu, Burera, and Nyabihu, and link to Rwanda Agriculture Board monitoring data.

---

## 12. Declarations

- **Originality:** The model, data fusion, and simulation built for the NISR 2026 Hackathon are the team's work. They build on earlier cyber-physical systems work at the University of Rwanda, College of Science and Technology.
- **AI tools:** AI assistants were used for code syntax checks, UI styling, and documentation structure. The epidemiological logic, data fusion, and configuration were reviewed by the authors.
- **Intellectual property:** The submitted work is assigned to NISR as specified in the competition rules.
