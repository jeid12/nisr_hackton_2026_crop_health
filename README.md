# CropHealth EWS: Micro-Climate Early Warning for Late and Early Blight

**NISR 2026 Big Data Hackathon · Track 1: Agricultural Productivity Challenge**

CropHealth EWS forecasts two fungal diseases of Irish potato and tomato, Late Blight (*Phytophthora infestans*, Kiniga) and Early Blight (*Alternaria solani*), for smallholder farms in Musanze District, Rwanda. A dual-output Random Forest model turns micro-climate readings into outbreak probabilities and risk tiers. The dashboard shows the risk in real time and drafts Kinyarwanda SMS advisories for farmers with basic feature phones. The aim is to replace calendar spraying with targeted spraying.

- **Model:** `models/crophealth_dual_rf_model.pkl` (details and metrics in [models/README.md](models/README.md))
- **Data:** `data/` (NISR SAS 2026 Season A tables, NASA POWER hourly telemetry, unified training dataset)
- **Live app:** add your deployed link here before submission

---

## Dashboard sign-in

The dashboard is protected by a sign-in page. Use these demo credentials:

| Field    | Value           |
|----------|-----------------|
| Username | `admin`         |
| Password | `crophealth2026`|

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
| `NEXT_PUBLIC_API_BASE` | frontend | Backend address (default `http://127.0.0.1:8000`). Set this to your deployed backend URL |

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

## Submission checklist (NISR webinar rules)

| Requirement | Status |
|-------------|--------|
| README explaining data, purpose, and interaction | Done (this file and `models/README.md`) |
| Scripts that run on any machine | Done (`app.py`, `backend/`, `frontend/`) |
| Demonstration video, 3 minutes maximum, in `demo/` | **Pending:** `demo/` is empty |
| Data files or links, noted in the README if too large | Done (`data/`) |
| Student cards for both members in `student_cards/` | Partly done: one file present, needs both members merged into `student_cards.pdf` |
| Public deployed app link, with sample credentials if login is required | **Pending:** add the link above and keep the demo credentials in this README |

---

## Known limitations

- The 12-hour rolling features used by the model are approximated from the current reading in the live simulator, so simulator probabilities can differ from the offline test results in `models/README.md`.
- The SMS gateway is simulated. Messages are logged but not sent through a real SIM800L modem.
- Session tokens are stored in the browser's local storage.

---

## Team and eligibility

Add team member names and university details here. Eligibility documents are in `student_cards/`.
