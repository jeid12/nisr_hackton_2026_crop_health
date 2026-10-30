import uuid
from datetime import datetime
from typing import List, Dict, Any

class SMSService:
    def __init__(self):
        self.audit_log: List[Dict[str, Any]] = []

    def format_sms(self, temp_c: float, humidity_pct: float, soil_pct: float, p_lb: float, p_eb: float) -> str:
        if p_lb >= 75.0:
            return (
                f"IMBURABUZI YA KINIGA: Ubuhehere buri hejuru ({humidity_pct:.0f}%), ubutaka buratose ({soil_pct:.0f}%), "
                f"n'ubushyuhe bwa {temp_c:.1f}°C byazamuye ibyago bya Kiniga kugera kuri {p_lb:.0f}%. "
                f"Fata ingamba zihuse utera umuti uvura (urugero: Ridomil)."
            )
        elif p_lb >= 45.0:
            return (
                f"IMBURABUZI: Ibyago byo gufatwa n'indwara ya Kiniga biri kuri {p_lb:.0f}%. "
                f"Ubuhehere ni {humidity_pct:.0f}%. Tera umuti urinda ibabi (urugero: Dithane/Mancozeb)."
            )
        elif p_eb >= 60.0:
            return (
                f"IMBURABUZI YA EARLY BLIGHT: Ubushyuhe bwa {temp_c:.1f}°C n'ubuhehere byateje ibyago bya Early Blight ({p_eb:.0f}%). "
                f"Tera umuti wa Copper Oxychloride."
            )
        else:
            return "Imiterere y'ikirere n'ubutaka itekanye: Nta muti w'uburozi ukenewe ubu. Witera umuti utari ngombwa ngo wice ubutaka."

    def dispatch_sms(self, farmer_name: str, phone_number: str, sector: str, message: str, risk_prob: float) -> Dict[str, Any]:
        dispatch_id = f"SMS-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        record = {
            "dispatch_id": dispatch_id,
            "farmer_name": farmer_name,
            "phone_number": phone_number,
            "sector": sector,
            "message": message,
            "risk_probability": risk_prob,
            "dispatched_at": timestamp,
            "gateway": "SIM800L / MTN Rwanda 2G",
            "delivery_status": "DELIVERED_200_OK"
        }
        self.audit_log.insert(0, record)
        return record

    def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        return self.audit_log[:limit]

sms_dispatcher = SMSService()
