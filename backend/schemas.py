from pydantic import BaseModel, Field
from typing import List, Optional

# --- Simulation Input Payload ---
class SimulationInput(BaseModel):
    temp_c: float = Field(..., ge=5.0, le=40.0, description="Ambient temperature in Celsius")
    humidity_pct: float = Field(..., ge=10.0, le=100.0, description="Relative humidity percentage")
    leaf_wetness_norm: float = Field(..., ge=0.0, le=1.0, description="Foliar wetness normalized (0.0 to 1.0)")
    soil_moisture_pct: float = Field(..., ge=5.0, le=100.0, description="Volumetric soil moisture percentage")
    stratum_type: int = Field(default=1, description="1: Mukungwa Wetland (Rwaza), 0: Hillside (Nkotsi)")
    wetness_duration_12h: Optional[float] = Field(default=None, ge=0.0, le=12.0)

# --- Dual Disease Prediction Response ---
class DiseaseRiskDetail(BaseModel):
    probability: float
    risk_tier: str          # SAFE | PREVENTIVE | EMERGENCY (for LB) / ACTIVE (for EB)
    status_color: str        # green | amber | red
    action_protocol: str

class SimulationResponse(BaseModel):
    status: str
    late_blight: DiseaseRiskDetail
    early_blight: DiseaseRiskDetail
    biological_diagnosis: str
    kinyarwanda_sms: str
    stratum_applied: str

# --- Analytics Time-Series Point ---
class TelemetryTrendPoint(BaseModel):
    timestamp: str
    temp_c: float
    humidity_pct: float
    leaf_wetness_pct: float
    soil_moisture_pct: float
    precipitation_mm: float
    late_blight_risk: float
    outbreak_warning_label: int

class TrendResponse(BaseModel):
    sector: str
    window_hours: int
    data: List[TelemetryTrendPoint]

# --- Feature Importance Item ---
class FeatureImportanceItem(BaseModel):
    feature: str
    importance_pct: float
    biological_significance: str

# --- SMS Dispatch Contract ---
class SMSDispatchPayload(BaseModel):
    farmer_name: str
    phone_number: str
    sector: str
    sms_message: str
    risk_probability: float

class SMSReceiptResponse(BaseModel):
    status: str
    dispatch_id: str
    recipient: str
    dispatched_at: str
    delivery_status: str
    message: str

# --- Authentication ---
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)

class LoginResponse(BaseModel):
    token: str
    username: str
    expires_in: int

class MeResponse(BaseModel):
    username: str
