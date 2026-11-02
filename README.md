# CropHealth EWS: Micro-Climate Early Warning for Late and Early Blight

**NISR 2026 Big Data Hackathon · Track 1: Agricultural Productivity Challenge**

CropHealth EWS forecasts two fungal diseases of Irish potato and tomato, Late Blight (*Phytophthora infestans*, Kiniga) and Early Blight (*Alternaria solani*), for smallholder farms in Musanze District, Rwanda. A dual-output Random Forest model turns micro-climate readings into outbreak probabilities and risk tiers. The dashboard shows the risk in real time and drafts Kinyarwanda SMS advisories for farmers with basic feature phones. The aim is to replace calendar spraying with targeted spraying.

- **Model:** `models/crophealth_dual_rf_model.pkl` (details and metrics in [models/README.md](models/README.md))
- **Data:** `data/` (NISR SAS 2026 Season A tables, NASA POWER hourly telemetry, unified training dataset)
- **Live app:** [https://nisr-hackton-2026-crop-health.vercel.app/](https://nisr-hackton-2026-crop-health.vercel.app/)
- **Google Colab notebooks:**

  [![Open Notebook 1 in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1oWh6HRInuMigTGqDerv6hQr76gTYSd4i?usp=sharing) [![Open Notebook 2 in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1g5ZgtUVVydzNUs9ITuvT42R7pYN0DIG6?usp=sharing)

---

## Evaluation criteria at a glance

| # | Criterion (points) | Where it is addressed |
|---|--------------------|-----------------------|
| 1 | Problem understanding and relevance (20) | [Criterion 1](#criterion-1-problem-understanding-and-relevance-20-pts) |
| 2 | Data use and methodology (20) | [Criterion 2](#criterion-2-data-use-and-methodology-20-pts) |
| 3 | Technology innovation (20) | [Criterion 3](#criterion-3-technology-innovation-20-pts) |
| 4 | Usability and design of the prototype (20) | [Criterion 4](#criterion-4-usability-and-design-of-the-prototype-20-pts) |
| 5 | Tangible impact (20) | [Criterion 5](#criterion-5-tangible-impact-20-pts) |

Future deployment on field sensors (IoT) is described in [Future work: IoT implementation roadmap](#future-work-iot-implementation-roadmap).

### Criterion 1: Problem understanding and relevance (20 pts)

**The problem.** Smallholder farmers of potato, tomato, pepper, and eggplant lose yield to fungal diseases, especially Late Blight (*Phytophthora infestans*) and Early Blight (*Alternaria solani*). Diseases develop with temperature, relative humidity, leaf wetness, and soil moisture. Most farmers spray on a routine schedule rather than on conditions, which wastes money on chemicals, leaves disease uncontrolled when conditions are dangerous, and adds chemical runoff to watersheds. In the NISR Seasonal Agricultural Survey (SAS) 2026 Season A, 74.11% of Musanze farmers reported applying chemical pesticides.

**The gap.** Farmers have no local, timely signal of when their own field crosses the threshold for fungal growth. They spray by guesswork.

**The response.** CropHealth EWS turns micro-climate conditions into a risk probability for each disease, a risk tier, and a recommended action. It sends the advice to farmers as Kinyarwanda SMS, so it works on basic feature phones without internet access.

**Alignment with national priorities**
- **NST2 Priority Area 1 (Economic Transformation):** modernises production, reduces yield losses, and cuts input costs.
- **NST2 Priority Area 2 (Social Transformation):** protects smallholder livelihoods and reduces unnecessary agrochemical spending.
- **Vision 2050:** supports a climate-smart, productive agricultural sector.
- **PSTA 5 and MINAGRI plant health strategies:** the project plan includes document review and alignment with these strategies.
- **Rwanda Agriculture and Animal Resources Development Board (RAB):** the project plan includes RAB as technical partner for extension and disease surveillance.
- **Law No. 058/2021 on personal data protection:** the data plan keeps farmer identifiers separate from analysis data.

### Criterion 2: Data use and methodology (20 pts)

**Datasets**
- **NISR SAS 2026 Season A tables:** district baselines for pesticide adoption, chemical distribution, and crop areas (`data/Tables_2026 Season A.xlsx`).
- **NASA POWER hourly agroclimate data:** Musanze (latitude -1.499, longitude 29.634), January to October 2026 (`data/POWER_Point_Hourly_*.csv`).
- **Unified training dataset:** 7,032 hourly records combining both sources with the foliar-wetness index (`data/crophealth_unified_nisr_2026.csv`).

**Method**
- A dual-output Random Forest classifier (120 trees, maximum depth 8) predicts Late Blight and Early Blight outbreak probabilities from the same inputs.
- The model uses 14 engineered features, including 12-hour rolling statistics for humidity, temperature, soil moisture, and wetness duration.
- Validation uses a chronological 80/20 split, so the model is tested only on hours it has not seen.
- Tree models need no feature scaling. Sensor flags are removed from rainfall data before training.
- Full feature definitions, performance figures, feature importances, and limitations are in [models/README.md](models/README.md).

**Honest scope.** Reported test results come from the team's training run. The training script is not yet in this repository, so those figures cannot be reproduced from the code here. The live simulator approximates the 12-hour features from a single reading, so its outputs are indicative rather than identical to offline test results (see [Known limitations](#known-limitations)).

### Criterion 3: Technology innovation (20 pts)

- **Dual-disease prediction in one model:** one Random Forest covers two pathogens with different environmental optima (cool-wet for Late Blight, warm-humid for Early Blight).
- **Decision support, not just a score:** each prediction maps to a risk tier and a recommended action, such as a systemic fungicide for an emergency or skipping spraying in safe conditions.
- **Kinyarwanda SMS advisories:** advice is generated in Kinyarwanda for feature-phone users. The SMS gateway is simulated in this prototype.
- **Modern, portable architecture:** a stateless FastAPI service with a trained model, a Next.js dashboard, token-based sign-in, and Docker images for both services, deployable on Render.
- **Designed for sensors:** the model's inputs match the variables that field sensors measure (temperature, humidity, leaf wetness, soil moisture), so hardware can be connected without redesigning the model (see the IoT roadmap).

### Criterion 4: Usability and design of the prototype (20 pts)

- **Sign-in and navigation:** a sign-in page guards the dashboard. A sidebar separates the Risk Simulator from Telemetry & NISR Data, shows the API status, and signs out. On phones, the sidebar becomes a drawer.
- **Risk Simulator:** sliders for temperature, humidity, leaf wetness, soil moisture, dew duration, and stratum. Three one-click presets cover a crisis, a warm-wet trigger, and a safe sunny afternoon. Each disease shows a gauge, a risk tier, and a recommended action.
- **Farmer SMS console:** shows the advisory as it would appear on a feature phone, with a delivery confirmation or failure message.
- **Telemetry and NISR data:** 48-hour panels for humidity, soil moisture, leaf wetness, temperature, and risk, on a shared time axis, with the 85% humidity and 18 °C thresholds marked. Also NISR chemical-distribution charts and feature importances.
- **Clear status:** risk tiers always show a label and an icon, not colour alone. Chart colours come from a palette checked for colour-vision accessibility.

### Criterion 5: Tangible impact (20 pts)

**Who can use it**
- Smallholder potato and tomato farmers, starting in the pilot districts of Musanze, Huye, and Kirehe (as planned in the project proposal).
- Farmer cooperatives and district agricultural officers, for field coordination.
- RAB and MINAGRI, for disease surveillance and policy reporting.
- Telecom providers, as the SMS delivery channel.

**Projected impact** (estimates from the project proposal, not measured in this prototype)
- Skipping unnecessary calendar sprays during safe periods could reduce fungicide use by an estimated 35% to 50%, saving up to about 120,000 RWF per hectare per season.
- Targeted application reduces metalaxyl and chlorothalonil runoff into the Mukungwa River watershed.
- The SMS design reaches farmers without smartphones or internet.
- The approach can scale to Rubavu, Burera, and Nyabihu, and connect to RAB's national monitoring data.

**Current status.** This is a working prototype with a live deployment. It has not yet been tested in a field pilot with farmers. The IoT roadmap below describes how it would move from prototype to field use.

---

## Dashboard sign-in

The dashboard is protected by a sign-in page. Use these demo credentials:

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| Password | `crophealth2026` |

These are demo credentials for evaluators. To change them, set `CROPHEALTH_USER`, `CROPHEALTH_PASSWORD`, and `CROPHEALTH_SECRET` in a `.env` file (see [.env.example](.env.example)) before you run the backend.

---

## Quick start

You need Python 3.12 and Node.js 18 or newer.

### 1. Backend (FastAPI, port 8000)

```bash
python3 -m venv env
source env/bin/activate          # Windows: env\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs at http://127.0.0.1:8000. Interactive docs are at http://127.0.0.1:8000/docs.

### 2. Frontend (Next.js, port 3000)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, then sign in with the credentials above.

### 3. Check that it works

```bash
curl http://127.0.0.1:8000/api/v1/health
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"crophealth2026"}'
```

Both should return JSON. The health check reports `"model_loaded": true`.

---

## Configuration

| Variable | Where | Purpose |
|----------|-------|---------|
| `CROPHEALTH_USER` | backend | Dashboard username (default `admin`) |
| `CROPHEALTH_PASSWORD` | backend | Dashboard password (default `crophealth2026`) |
| `CROPHEALTH_SECRET` | backend | Token signing key. If unset, a random key is created at startup and all sessions end when the backend restarts |
| `API_BASE` | dashboard container | Backend address the dashboard calls (default `http://localhost:8000` in Docker Compose). Set this to your deployed API URL |

Copy `.env.example` to `.env` and edit it. Never commit `.env`.

---

## Features

- **Risk simulator:** adjust air temperature, humidity, leaf wetness, soil moisture, dew duration, and agro-stratum (Rwaza wetland or Nkotsi hillside). Three presets cover the crisis, warm-wet, and safe scenarios. The page shows both outbreak probabilities as gauges with risk tiers and recommended actions.
- **SMS dispatch:** a feature-phone console that sends the Kinyarwanda advisory to a farmer's number and confirms delivery or reports failure.
- **Telemetry and NISR data:** 48-hour trends for each sector, with humidity, soil moisture, leaf wetness, and temperature panels against the 85% RH and 18 °C thresholds. Also NISR SAS 2026 chemical-use tables and model feature importance.
- **Sign-in:** token-based login with a 12-hour session. Routes and the dashboard are guarded.

---

## Architecture

```
┌──────────────────────────────┐        HTTP/JSON        ┌────────────────────────────────┐
│ Frontend (Next.js 14, React) │ ──────────────────────▶ │ Backend (FastAPI, Python 3.12) │
│ Sidebar · Login · Charts     │                         │ auth · predict · analytics ·   │
│ Tailwind CSS · Recharts      │ ◀────────────────────── │ alerts (SMS)                   │
└──────────────────────────────┘                         └───────────────┬────────────────┘
                                                                         │
                                              ┌──────────────────────────┴──────────────┐
                                              ▼                                         ▼
                                  models/crophealth_dual_rf_model.pkl     data/crophealth_unified_nisr_2026.csv
```

### Backend layout

| File | Role |
|------|------|
| `app.py` | Starts the Uvicorn server |
| `backend/main.py` | FastAPI app and routes |
| `backend/auth.py` | Credential check and signed session tokens |
| `backend/ml_service.py` | Loads the model and builds risk predictions |
| `backend/analytics_service.py` | Telemetry trends, NISR benchmarks, feature importance |
| `backend/sms_service.py` | Kinyarwanda advisory text and dispatch log |
| `backend/schemas.py` | Request and response models |

### API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | Sign in and receive a token |
| GET | `/api/v1/auth/me` | Check a token (send `Authorization: Bearer <token>`) |
| GET | `/api/v1/health` | Service status and model load state |
| POST | `/api/v1/predict/simulate` | Dual-pathogen probabilities, tiers, and SMS text |
| GET | `/api/v1/analytics/trends?hours=48&sector=Rwaza` | Time-series telemetry |
| GET | `/api/v1/analytics/nisr-benchmarks` | Official NISR SAS 2026 tables |
| GET | `/api/v1/analytics/feature-importance` | Model feature ranking |
| POST | `/api/v1/alerts/dispatch-sms` | Log an SMS advisory dispatch |
| GET | `/api/v1/alerts/history` | Recent dispatch log |

**Security note:** the sign-in protects the dashboard screens. The API endpoints above are open to anyone who can reach the backend, so do not expose it publicly without adding authentication to those routes.

---

## Repository structure

```
.
├── README.md                  this file
├── app.py                     backend entry point
├── requirements.txt           Python dependencies
├── .env.example               configuration template (copy to .env)
├── backend/                   FastAPI services
├── frontend/                  Next.js dashboard
├── data/                      NISR tables, NASA POWER telemetry, unified dataset
├── models/                    trained model and model documentation
├── hardware/                  SMS gateway hardware reference
├── demo/                      demonstration recording (demo.webm)
└── student_cards/             eligibility documents for team members
```

---

## Run with Docker (local)

You need Docker Desktop (or Docker Engine with the Compose plugin).

```bash
docker compose up --build
```

- Dashboard: http://localhost:3000 (sign in with `admin` / `crophealth2026`)
- API and interactive docs: http://localhost:8000/docs

Stop with `Ctrl+C`, or `docker compose down`. The API image is built from the repository root `Dockerfile`, and the dashboard image from `frontend/Dockerfile` (a Next.js static export served by nginx).

## Deployment (Render, Docker)

Both services run as Docker containers on Render's free plan, using the `render.yaml` blueprint:

| Service | Image source | Port |
|---------|--------------|------|
| `crophealth-api` | `Dockerfile` (FastAPI) | Render `$PORT` |
| `crophealth-dashboard` | `frontend/Dockerfile` (nginx serving the dashboard) | Render `$PORT` |

**Steps**
1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, select the repository, and apply. Render builds and starts both services.
3. Open `crophealth-api` and copy its URL (for example `https://crophealth-api.onrender.com`). Check `<url>/api/v1/health` shows `"model_loaded": true`.
4. Open `crophealth-dashboard`, go to **Environment**, set `API_BASE` to the API URL from step 3, and save. The container reads it at start, so no rebuild is needed.
5. Open the dashboard URL. That is the live link. Sign in with `admin` / `crophealth2026`.

**Notes**
- Free services sleep after 15 minutes without traffic and take about a minute to wake. Open the link shortly before evaluation.
- The first Docker build on Render takes several minutes, because it installs the scientific Python packages.

**Live app:** [https://nisr-hackton-2026-crop-health.vercel.app/](https://nisr-hackton-2026-crop-health.vercel.app/) · **Sign-in:** `admin` / `crophealth2026`

---

## Submission checklist (NISR webinar rules)

| Requirement | Status |
|-------------|--------|
| README explaining data, purpose, and interaction | Done (this file and `models/README.md`) |
| Scripts that run on any machine | Done (`app.py`, `backend/`, `frontend/`, `requirements.txt`) |
| Demonstration video, 3 minutes maximum, in `demo/` | Done: `demo/demo.webm` (2 min 42 s, screen recording of the running dashboard with burned-in captions; subtitles also in `demo/demo.vtt`) |
| Data files or links, noted in the README if too large | Done (`data/`, about 1 MB) |
| Student cards for both members in `student_cards/` | **Pending:** one card is present; the second member's card must be added and merged into `student_cards/student_cards.pdf` |
| Public GitHub repository | **Pending:** push to a public repository |
| Public deployed app link, with sample credentials | **Pending:** deploy using the steps above and paste the link in this README |

---

## Future work: IoT implementation roadmap

This section describes the planned field deployment. None of the sensor hardware below is installed or connected in the current prototype. The dashboard currently uses slider inputs and historical data, not live sensors.

### Planned farm sensor kit (per farm)

| Component | Measures |
|-----------|----------|
| ESP32 microcontroller with GSM/Wi-Fi | Collects readings and sends them to the cloud |
| DHT22 sensor | Ambient temperature and relative humidity at canopy height |
| DS18B20 sensor | Soil temperature |
| Capacitive soil-moisture sensor | Root-zone volumetric moisture |
| Grid-electrode leaf-wetness sensor | Leaf surface wetness (the strongest driver in the model) |
| 5 W solar panel and 3.7 V Li-ion battery | Off-grid power |
| IP65 weatherproof enclosure | Field protection |

### Deployment protocol
1. Install sensors at crop canopy height and in the root zone.
2. Calibrate each sensor against reference instruments before deployment.
3. Record GPS coordinates and installation metadata.
4. Transmit readings over MQTT to the cloud gateway every 15 minutes.
5. Run weekly data-quality checks for out-of-range values, missing data, and sensor drift.

### Software integration plan
1. **Ingestion:** an MQTT broker receives readings from the sensors and stores them in a time-series database (PostgreSQL or InfluxDB, as in the project plan).
2. **Real history:** the stored readings replace the single-reading approximation in the simulator. The 12-hour features are then computed from real history, as in training.
3. **Live inference:** the existing prediction endpoint accepts the same variables the sensors measure, so the model can run on live farm data with no change to the model's inputs.
4. **Alerts:** when risk reaches a threshold, the existing SMS advisory is sent to the registered farmer. Farmers can also report disease by SMS or USSD.
5. **Feedback loop:** scouting results, farmer reports, and sprayed-or-not outcomes are recorded and used to retrain and improve the model.

### Field validation plan (from the project proposal)
- **Sites:** Musanze (Northern Highlands), Huye (Southern Plateau), and Kirehe (Eastern lowlands), with 15 to 20 farms per district, selected with cooperatives.
- **Ground truth:** weekly scouting on a standard 0 to 9 severity scale, farmer reports, photographs of symptoms, and lab confirmation of a subset of samples with RAB.
- **Baseline:** a structured survey of about 500 farmers on current spraying practice, costs, yields, phone access, willingness to pay, and language preference.
- **Weather inputs:** Rwanda Meteorology Agency records (5+ years) for training, with weather APIs (for example OpenWeatherMap or Meteoblue) as a secondary source.

### Model extensions (from the project proposal)
- **Diseases:** add Powdery Mildew (*Leveillula taurica*) and Anthracnose (*Colletotrichum* species) beside Late and Early Blight.
- **Forecast horizon:** move from the current per-hour risk to the proposal's design, which uses 24 to 72 hours of history to predict outbreak probability within the next 7 days.
- **Channels:** add USSD for farmers without smartphones.

### Data governance
- All farm data is stored securely, analysed in anonymised form, and kept separate from farmer identifiers.
- Data handling follows Rwanda's Law No. 058/2021 on personal data protection.

---

## Known limitations

- The 12-hour rolling features used by the model are approximated from the current reading in the live simulator, so simulator probabilities can differ from the offline test results in `models/README.md`.
- The SMS gateway is simulated. Messages are logged but not sent through a real SIM800L modem.
- Session tokens are stored in the browser's local storage.

---

## Team and eligibility

**Team**
- NIYOKWIZERA JEAN D AMOUR
- UWASE YVONNE

**Affiliation:** African Institute for Mathematical Sciences (AIMS)

Eligibility documents are in `student_cards/`.
