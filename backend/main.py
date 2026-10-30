from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from fastapi import Header
from backend.schemas import (
    SimulationInput, SimulationResponse, TrendResponse, 
    FeatureImportanceItem, SMSDispatchPayload, SMSReceiptResponse,
    LoginRequest, LoginResponse, MeResponse
)
from backend.auth import check_credentials, issue_token, verify_token, TOKEN_TTL_SECONDS
from backend.ml_service import ml_engine
from backend.analytics_service import analytics_engine
from backend.sms_service import sms_dispatcher

app = FastAPI(
    title="CropHealth AI Early Warning Service",
    description="NISR 2026 Big Data Hackathon Engine: Micro-Climate Disease Simulation & Analytics",
    version="2.0.0"
)

# Enable CORS for Next.js (localhost:3000 and production domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    if not check_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {
        "token": issue_token(payload.username),
        "username": payload.username,
        "expires_in": TOKEN_TTL_SECONDS,
    }

@app.get("/api/v1/auth/me", response_model=MeResponse)
def me(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    username = verify_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return {"username": username}

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "online",
        "service": "CropHealth EWS Backend",
        "model_loaded": ml_engine.model is not None,
        "records_indexed": len(analytics_engine.df) if analytics_engine.df is not None else 0
    }

# 1. Real-Time Parameter Simulation Endpoint
@app.post("/api/v1/predict/simulate", response_model=SimulationResponse)
def simulate_prediction(payload: SimulationInput):
    try:
        prediction = ml_engine.predict(
            temp_c=payload.temp_c,
            humidity_pct=payload.humidity_pct,
            leaf_wetness_norm=payload.leaf_wetness_norm,
            soil_moisture_pct=payload.soil_moisture_pct,
            stratum_type=payload.stratum_type,
            wetness_duration_12h=payload.wetness_duration_12h
        )

        p_lb = prediction["late_blight"]["probability"]
        p_eb = prediction["early_blight"]["probability"]

        kinyarwanda_sms = sms_dispatcher.format_sms(
            payload.temp_c, payload.humidity_pct, payload.soil_moisture_pct, p_lb, p_eb
        )

        return {
            "status": "success",
            "late_blight": prediction["late_blight"],
            "early_blight": prediction["early_blight"],
            "biological_diagnosis": prediction["biological_diagnosis"],
            "kinyarwanda_sms": kinyarwanda_sms,
            "stratum_applied": prediction["stratum_applied"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Time-Series Telemetry for Recharts
@app.get("/api/v1/analytics/trends", response_model=TrendResponse)
def get_trends(
    hours: int = Query(default=72, ge=12, le=336),
    sector: str = Query(default="Rwaza")
):
    trends = analytics_engine.get_recent_trends(window_hours=hours, sector=sector)
    return {
        "sector": sector,
        "window_hours": hours,
        "data": trends
    }

# 3. Official NISR SAS 2026 District Baselines
@app.get("/api/v1/analytics/nisr-benchmarks")
def get_nisr_benchmarks() -> Dict[str, Any]:
    return analytics_engine.get_nisr_benchmarks()

# 4. Gini Feature Importances (Model Explainability)
@app.get("/api/v1/analytics/feature-importance", response_model=List[FeatureImportanceItem])
def get_feature_importance():
    return analytics_engine.get_feature_importances()

# 5. Dispatch SMS to Farmer (Simulated Hardware Relay)
@app.post("/api/v1/alerts/dispatch-sms", response_model=SMSReceiptResponse)
def dispatch_sms(payload: SMSDispatchPayload):
    try:
        record = sms_dispatcher.dispatch_sms(
            farmer_name=payload.farmer_name,
            phone_number=payload.phone_number,
            sector=payload.sector,
            message=payload.sms_message,
            risk_prob=payload.risk_probability
        )
        return {
            "status": "success",
            "dispatch_id": record["dispatch_id"],
            "recipient": f"{record['farmer_name']} ({record['phone_number']})",
            "dispatched_at": record["dispatched_at"],
            "delivery_status": record["delivery_status"],
            "message": record["message"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Audit Log History
@app.get("/api/v1/alerts/history")
def get_alert_history():
    return sms_dispatcher.get_history()
