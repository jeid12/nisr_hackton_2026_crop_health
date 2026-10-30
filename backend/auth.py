import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Optional

# Demo credentials for the hackathon dashboard. Override with environment variables in any real deployment.
AUTH_USERNAME = os.environ.get("CROPHEALTH_USER", "admin")
AUTH_PASSWORD = os.environ.get("CROPHEALTH_PASSWORD", "crophealth2026")

# Tokens are signed with this key. Without the env var a random key is generated at startup,
# so all sessions end when the backend restarts.
_SECRET = os.environ.get("CROPHEALTH_SECRET") or secrets.token_hex(32)
TOKEN_TTL_SECONDS = 12 * 3600


def check_credentials(username: str, password: str) -> bool:
    user_ok = hmac.compare_digest(username.encode(), AUTH_USERNAME.encode())
    pass_ok = hmac.compare_digest(password.encode(), AUTH_PASSWORD.encode())
    return user_ok and pass_ok


def _sign(body: str) -> str:
    return hmac.new(_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()


def issue_token(username: str) -> str:
    payload = {"sub": username, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    return f"{body}.{_sign(body)}"


def verify_token(token: str) -> Optional[str]:
    """Return the username if the token is valid and unexpired, otherwise None."""
    try:
        body, signature = token.rsplit(".", 1)
    except ValueError:
        return None
    if not hmac.compare_digest(signature, _sign(body)):
        return None
    try:
        payload = json.loads(base64.urlsafe_b64decode(body.encode()))
    except (ValueError, json.JSONDecodeError):
        return None
    if payload.get("exp", 0) < time.time():
        return None
    return payload.get("sub")
