# 🌱 CropHealth EWS: AI & Micro-Climate Disease Forecasting Engine
> **National Institute of Statistics of Rwanda (NISR) — 2026 Big Data Hackathon**  
> **Track:** Track 1: Agricultural Productivity Challenge  
> **Deployed Application:** [Live App Link](https://crop-health-node.vercel.app) *(or Streamlit Community Cloud)*[cite: 7, 8, 20]  
> **Demonstration Video:** `demo/demo.webm` (Full UI & simulation walkthrough, < 3 mins)[cite: 21, 22]  
> **Eligibility Verification:** `student_cards/student_cards.pdf`[cite: 21, 22]

---

## Table of Contents
1. [Executive Summary & NST2 Alignment](#1-executive-summary--nst2-alignment-20-pts)
2. [The Agricultural Challenge & NISR SAS 2026 Evidence](#2-the-agricultural-challenge--nisr-sas-2026-evidence)
3. [Multi-Source Data Fusion & Feature Engineering](#3-multi-source-data-fusion--feature-engineering-20-pts)
4. [Machine Learning Engine & Empirical Benchmarks](#4-machine-learning-engine--empirical-benchmarks-20-pts)
5. [End-to-End System Architecture](#5-end-to-end-system-architecture-20-pts)
6. [Interactive Simulation & Dashboard User Guide](#6-interactive-simulation--dashboard-user-guide-20-pts)
7. [Measurable Socio-Economic & Ecological Impact](#7-measurable-socio-economic--ecological-impact-20-pts)
8. [Repository Structure (NISR Mandatory Layout)](#8-repository-structure-nisr-mandatory-layout)
9. [Installation & Reproduction Guide](#9-installation--reproduction-guide)
10. [AI Disclosure & Competition Declarations](#10-ai-disclosure--competition-declarations)

---

## 1. Executive Summary & NST2 Alignment (20 pts)
In Rwanda's fertile volcanic corridors—predominantly the Musanze District—smallholder cultivation of Solanaceous crops (Irish potatoes and tomatoes) is chronically undermined by rapid-onset fungal blights: **Phytophthora infestans (Late Blight / *Kiniga*)** and **Alternaria solani (Early Blight)**[cite: 1]. Under Rwanda's bimodal rainy seasons, localized losses frequently reach **40% annually**[cite: 1].

Lacking localized disease forecasting tools, smallholders resort to **"calendar spraying"**—applying synthetic fungicides on a rigid weekly schedule regardless of biological risk[cite: 1]. This practice inflates household production costs, induces chemical resistance in pathogens, and contaminates volcanic water tables[cite: 1].

**CropHealth EWS** transitions Rwandan horticulture from blind prophylactic chemical application to **data-driven predictive prevention**[cite: 1]. By fusing macro-level **NISR Seasonal Agricultural Survey (SAS 2026 Season A)** district baselines with **7,032 continuous hours of micro-climate and root-zone soil moisture telemetry**, our multi-output **Random Forest AI engine** forecasts pathogen incubation windows **48 to 72 hours before visible foliar lesions occur**[cite: 1]. When biological thresholds are breached, the system deterministically formats actionable early warning alerts dispatched natively in **Kinyarwanda via offline SMS**, bridging the digital divide for smallholders operating on basic feature phones without internet access[cite: 1].

### Alignment with National Priorities (NST2 & Vision 2050)
- **NST2 Priority Area 1 (Economic Transformation):** Modernizes agricultural production, reduces crop yield losses, and maximizes commercial market output.
- **NST2 Priority Area 2 (Social Transformation):** Protects rural smallholder livelihoods and cuts input expenditures on unneeded agrochemicals[cite: 1].
- **Climate-Smart Agriculture Directives:** Eliminates chemical runoff (Metalaxyl, Chlorothalonil) into the Mukungwa River watershed, aligning with World Bank IPM and RAB environmental standards[cite: 1].

---

## 2. The Agricultural Challenge & NISR SAS 2026 Evidence
According to the official **NISR Seasonal Agricultural Survey (SAS) 2026 Season A** report:
* **High Chemical Pesticide Adoption (Table 29):** **74.11% of all farmers in Musanze District apply chemical pesticides** (73.89% among small-scale farmers and **100% of large-scale farmers**). Pesticides are applied across **59.91% of agricultural plots** and **62.76% of total cultivated land size**.
* **Fungicide Application Dominance (Table 30):** Targeted late blight fungicides dominate farm applications in Musanze:
  * **Dithane (Mancozeb - Contact Surface Protectant):** Applied on **28.89%** of treated plots.
  * **Ridomil (Metalaxyl - Systemic Curative):** Applied on **3.21%** of treated plots.
  * *Combined, late blight chemical controls account for over 32.1% of all chemical interventions across the district.*
* **High-Risk Crop Concentration (Table 11):** Musanze cultivates **4,978.37 Hectares of Irish potatoes** and **837.36 Hectares of commercial vegetables (including tomatoes)**, representing Rwanda's most critical vegetable supply chain.

### The Operational Gap
Smallholders currently scout fields visually and spray after spotting necrotic lesions[cite: 1]. Because Late Blight incubation takes 3 to 5 days, visual identification means systemic biological rot is already irreversible[cite: 1]. Conversely, spraying during sunny, dry weeks wastes critical household capital[cite: 1].

---

## 3. Multi-Source Data Fusion & Feature Engineering (20 pts)
Pathogen incubation occurs within the **phyllosphere** (the micro-climatic boundary layer immediately surrounding plant leaves)[cite: 1]. Because survey data is collected seasonally while fungal spores incubate hourly, this project introduces a multi-tiered data fusion pipeline[cite: 1]:
┌────────────────────────────────────────────────────────────────────────┐
│                      MULTI-TIERED DATA FUSION                          │
└───────────────────────────────────┬────────────────────────────────────┘
│
┌───────────────────────────────┼───────────────────────────────┐
▼                               ▼                               ▼
[ Tier 1: NISR SAS 2026 ]     [ Tier 2: Open NASA Telemetry ] [ Tier 3: Foliar Physics ]Musanze Baseline: 74.11%    - Lat: -1.499, Lon: 29.634       - Foliar Dew CondensationDithane Share: 28.89%       - 7,032 Hourly Observations      - Rain Surface PersistenceRidomil Share: 3.21%        - Temp (2m), RH (2m), Precip     - Normalized Wetness (W_t)Land Strata (Table 2 & 3)   - Volumetric Soil Moisture       - 0.0 (Dry) to 1.0 (Film)
│                               │                               │
└───────────────────────────────┼───────────────────────────────┘
▼
[ Unified Dataset: data/crophealth_unified_nisr_2026.csv ]
### The 14 Engineered Feature Predictors
1. `temp_c`: Instantaneous ambient canopy temperature ($10.8^\circ\text{C} - 27.9^\circ\text{C}$)[cite: 1].
2. `humidity_pct`: Relative atmospheric humidity ($28.8\% - 100.0\%$)[cite: 1].
3. `leaf_wetness_norm`: Physical leaf surface moisture index ($0.0 - 1.0$)[cite: 1].
4. `soil_moisture_pct`: Volumetric root-zone water content ($41.0\% - 88.0\%$).
5. `soil_moisture_rolling_mean_12h`: Rolling 12-hour average soil moisture.
6. `soil_saturated_hours_12h`: Accumulated hours where soil moisture was $\ge 65.0\%$.
7. `temp_rolling_mean_12h`: Rolling 12-hour ambient thermal average.
8. `temp_rolling_min_12h`: Nocturnal temperature drop capturing thermal incubation chill[cite: 1].
9. `humidity_rolling_mean_12h`: 12-hour sustained atmospheric saturation.
10. `high_hum_hours_12h`: Continuous hours in past 12h where relative humidity $\ge 85.0\%$[cite: 1].
11. `wetness_duration_12h`: Continuous foliar moisture hours ($W_t \ge 0.5$)[cite: 4].
12. `precipitation_mm`: Hourly rainfall volume (cleared of sensor flags).
13. `stratum_type`: 1 for Mukungwa Wetland (Rwaza), 0 for Volcanic Hillside (Nkotsi)[cite: 1].
14. `nisr_pesticide_adoption_rate`: Musanze district benchmark ($0.7411$).

---

## 4. Machine Learning Engine & Empirical Benchmarks (20 pts)
To handle both primary fungal threats simultaneously, we engineered a **Multi-Output Random Forest Classifier** that predicts two independent binary targets:
1. **Late Blight (*Phytophthora infestans*):** Cool-wet vector ($T_{\text{opt}} \approx 18.0^\circ\text{C}, RH \ge 85\%$)[cite: 1].
2. **Early Blight (*Alternaria solani*):** Warm-humid vector ($T_{\text{opt}} \approx 24.5^\circ\text{C}, RH \ge 75\%$).

### Model Comparison & Justification
All candidate models were evaluated on the same 80/20 chronological time-series split (evaluating strictly on the final 1,407 unseen hours):

| Model Architecture | Test Accuracy | ROC-AUC | Precision | Recall (Sensitivity) | F1-Score | Feature Scale Drift |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (120 Trees)** | **96.73%** | **0.9956** | 98.21% | **96.99%** | **0.9760** | **Immune (No scaling needed)** |
| Logistic Regression | 96.59% | 0.9956 | 98.31% | 96.68% | 0.9749 | Vulnerable (Requires scaling) |
| HistGradientBoosting | 96.52% | 0.9945 | 98.52% | 96.37% | 0.9743 | Prone to sensor noise overfitting |
| Single Decision Tree | 85.57% | 0.8115 | 86.69% | 93.26% | 0.8986 | High Variance / Instability |

### Multi-Output Test Horizon Results (N = 1,407 Hours)
* **Late Blight Classifier:** **96.30% Accuracy** | **0.9955 ROC-AUC** | **0.9727 F1-Score**
* **Early Blight Classifier:** **86.28% Accuracy** | **0.9859 ROC-AUC** | **0.8765 F1-Score**
* **Recall Priority:** In crop disease warning systems, a **False Negative** (missed outbreak) causes total field loss, while a **False Positive** triggers only an inspection[cite: 1]. The Random Forest model achieved **96.99% Recall**, missing only 29 of 964 true infection windows.

### White-Box Agronomic Explainability (Gini Impurity)
1. **Foliar Wetness Duration (34.1%):** Captures the physical liquid film necessary for zoospore encystment and penetration[cite: 1, 4].
2. **High Humidity Duration (12.3%):** $RH \ge 85\%$ prevents droplet evaporation and sustains sporangia viability[cite: 1, 4].
3. **Volumetric Soil Moisture (10.6%):** Root-zone waterlogging promotes upward micro-capillary evapotranspiration, maintaining elevated canopy humidity.
4. **Nocturnal Temperature Drop (5.6%):** Nocturnal cooling toward 18°C triggers dew point condensation[cite: 1].

---

## 5. End-to-End System Architecture (20 pts)
The platform is organized into three decoupled layers[cite: 1]:

┌────────────────────────────────────────────────────────────────────────┐
│                  LAYER 1: USER INTERACTION & WEB GUI                   │
│   Next.js 14 + TypeScript • Tailwind CSS • Multi-Axis Recharts         │
│   - Real-Time Simulation Sliders (Temp, Humidity, Wetness, Soil)       │
│   - 48-Hour Micro-Climate Dynamics Chart vs Pathogen Thresholds        │
│   - NISR SAS 2026 District Chemical Adoption Breakdown                │
│   - Feature Phone SMS Dispatch Console                                 │
└───────────────────────────────────┬────────────────────────────────────┘
│ HTTP REST / JSON
▼
┌────────────────────────────────────────────────────────────────────────┐
│                  LAYER 2: CLOUD ANALYTICS & INFERENCE                  │
│   FastAPI Middleware Engine (Uvicorn / Python 3.12)                   │
│   - POST /api/v1/predict/simulate  ──► Evaluates Multi-Output RF Model  │
│   - GET  /api/v1/analytics/trends  ──► Streams 48h Telemetry from CSV  │
│   - GET  /api/v1/analytics/nisr    ──► Serves Official SAS Baselines   │
│   - POST /api/v1/alerts/dispatch   ──► Formats Kinyarwanda SMS Alert   │
└───────────────────────────────────┬────────────────────────────────────┘
│
┌───────────────────────────────┴───────────────────────────────┐
▼                                                               ▼
[ models/crophealth_dual_rf_model.pkl ]             [ data/crophealth_unified_nisr_2026.csv ]   
---

## 6. Interactive Simulation & Dashboard User Guide (20 pts)

### Section A: Risk Simulator Console
1. **One-Click Agro-Ecological Presets:**
   * **Rwaza Marshland Mist (Crisis):** $T=16.8^\circ\text{C}, RH=96\%, W_t=0.95, \text{Soil}=78\% \rightarrow$ **Late Blight EMERGENCY (99.8%)**[cite: 1].
   * **Nkotsi Hillside Warm & Humid:** $T=25.2^\circ\text{C}, RH=84\%, W_t=0.70, \text{Soil}=58\% \rightarrow$ **Early Blight ACTIVE (72.4%)**[cite: 1].
   * **Dry Sunny Afternoon (Safe State):** $T=26.5^\circ\text{C}, RH=42\%, W_t=0.00, \text{Soil}=42\% \rightarrow$ **SAFE STATE (2.4%)**[cite: 1].
2. **Interactive Parameter Sliders:** Evaluators can manually adjust temperature, humidity, leaf wetness, soil moisture, and dew duration to verify model outputs in real time.
3. **Automated Kinyarwanda Early Warning Generation:**
   * *Emergency Alert Example:*  
     `"IMBURABUZI YA KINIGA: Ubuhehere buri hejuru (96%), ubutaka buratose (78%), n'ubushyuhe bwa 16.8°C byateje ibyago bya Kiniga (99%). Fata ingamba zihuse utera umuti uvura (urugero: Ridomil)."`
   * *Safe State Example:*  
     `"Imiterere y'ikirere n'ubutaka itekanye: Nta muti w'uburozi ukenewe ubu. Witera umuti utari ngombwa ngo wice ubutaka."`
4. **SMS Dispatch Action:** Clicking **"Dispatch SMS"** formats and logs the advisory to simulate sending directly to a farmer's feature phone via an off-grid GSM gateway[cite: 1].

### Section B: Telemetry & NISR Data Center
1. **48-Hour Micro-Climate Dynamics Chart:** Visualizes continuous fluctuations in ambient temperature against the 18°C late blight line, and relative humidity against the 85% threshold line[cite: 1].
2. **NISR Chemical Distribution:** Visualizes the breakdown of chemical usage across Musanze farm plots based on Table 30 of the 2026 survey.
3. **Feature Importance Visualizer:** Displays biological Gini contributions, confirming model explainability[cite: 4].

---

## 7. Measurable Socio-Economic & Ecological Impact (20 pts)
1. **Household Income Protection:** Eliminating 35% to 50% of unnecessary calendar sprays during safe periods saves smallholder families up to **120,000 RWF per hectare per season** in fungicide purchases[cite: 1].
2. **Environmental & Water Table Protection:** Eliminates uncalibrated runoff of toxic metalaxyl and chlorothalonil into the volcanic soil and Mukungwa River watershed[cite: 1].
3. **Inclusive Rural Accessibility:** By relying on standard GSM/2G SMS in native Kinyarwanda, the system serves farmers with basic feature phones, overcoming smartphone and internet barriers[cite: 1].
4. **Institutional Scalability:** Designed for integration with the **Rwanda Agriculture Board (RAB)** national crop monitoring data grid, scalable to Rubavu, Burera, and Nyabihu[cite: 1].

---

## 8. Repository Structure (NISR Mandatory Layout)
In accordance with **Slide 18 of the NISR Hackathon Submission Webinar**, this repository includes all mandatory files[cite: 22]:

```text
crophealth-nisr-2026/
│
├── README.md                      # [MANDATORY 1] Comprehensive project documentation[cite: 21, 22]
├── requirements.txt               # [MANDATORY 2] Python package dependencies[cite: 8, 22]
├── app.py                         # [MANDATORY 2] FastAPI application entry point[cite: 8, 22]
│
├── student_cards/                 # [MANDATORY 5] Eligibility documents for BOTH members[cite: 21, 22]
│   └── student_cards.pdf          # Merged official student IDs[cite: 21, 22]
│
├── demo/                          # [MANDATORY 3] Video walkthrough (Max 3 minutes)[cite: 21, 22]
│   └── demo.webm                  # Screen recording of UI and simulation[cite: 21, 22]
│
├── data/                          # [MANDATORY 4] Fused datasets & data lineage[cite: 21, 22]
│   ├── crophealth_unified_nisr_2026.csv   # 7,032-hour unified dataset
│   ├── Tables_2026_Season_A.xlsx          # Excerpt of NISR SAS 2026 tables
│   ├── prepare_data.py                    # Data cleaning & physics fusion pipeline
│   └── README.md                          # Data lineage statement
│
├── models/                        # Serialized Machine Learning models
│   ├── crophealth_dual_rf_model.pkl       # Trained Multi-Output Random Forest model
│   └── train_model.py                     # Model training script
│
├── backend/                       # FastAPI REST API Engine[cite: 10]
│   ├── main.py                    # REST API endpoints
│   ├── ml_service.py              # In-memory dual-disease inference engine
│   ├── analytics_service.py       # Time-series & NISR benchmark provider
│   ├── sms_service.py             # Kinyarwanda SMS formatting & audit logger[cite: 1]
│   ├── schemas.py                 # Pydantic data contracts
│   └── Dockerfile                 # Containerization configuration
│
└── frontend/                      # Next.js + TypeScript Presentation Dashboard[cite: 7, 16]
    ├── components/
    │   ├── Navbar.tsx             # Navigation header
    │   ├── SimulatorConsole.tsx   # Interactive micro-climate parameter sliders
    │   └── TelemetryCharts.tsx    # Multi-axis Recharts & NISR comparisons
    ├── pages/
    │   ├── _app.tsx               # Next.js application shell
    │   └── index.tsx              # Main dashboard view
    ├── styles/globals.css         # Tailwind CSS styling
    ├── types/index.ts             # TypeScript interface contracts
    ├── package.json               # Node.js dependencies
    └── tsconfig.json              # TypeScript configuration
9. Installation & Reproduction GuidePrerequisitesPython 3.10+Node.js 18+ and npmTerminal 1: Backend SetupBash# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Train the dual Random Forest model (if not already compiled)
python models/train_model.py

# 3. Start the FastAPI backend
python app.py
Backend runs on http://127.0.0.1:8000. Interactive API Docs are available at http://127.0.0.1:8000/docs.Terminal 2: Frontend SetupBash# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start Next.js development server
npm run dev
Frontend runs on http://localhost:3000.10. AI Disclosure & Competition DeclarationsCompetition: NISR 2026 Big Data Hackathon   Track: Track 1: Agricultural Productivity Challenge   Originality Attestation: This submission represents our original research and system implementation. It builds upon foundational Cyber-Physical Systems engineering conducted at the University of Rwanda, College of Science and Technology (UR-CST), extended specifically for the NISR 2026 Hackathon to incorporate NISR SAS 2026 data fusion, root-zone soil moisture indicators, dual-disease prediction, and real-time parameter simulation.   AI Tool Disclosure: In compliance with competition guidelines, AI assistants were utilized for syntax validation, UI styling, and documentation structure. All epidemiological equations, data fusion logic, and system configurations were reviewed and verified by the authors.   Intellectual Property Agreement: We acknowledge and agree to assign and transfer intellectual property rights of the submitted work to the National Institute of Statistics of Rwanda (NISR) as specified in the competition rules[cite: 20].