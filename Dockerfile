# CropHealth EWS backend (FastAPI). Build from the repository root.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so this layer is cached between code changes
COPY requirements.txt .
RUN pip install -r requirements.txt

# Application code, trained model, and the telemetry file the API reads (see .dockerignore)
COPY . .

# Run as an unprivileged user
RUN useradd --create-home --uid 1000 appuser && chown -R appuser /app
USER appuser

# Render sets PORT; default to 8000 for local runs
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
