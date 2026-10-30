#!/bin/sh
# Runs when the container starts (nginx image hook). Writes the API address the dashboard should call.
set -e
cat > /usr/share/nginx/html/config.js <<JS
window.CROPHEALTH_API_BASE = "${API_BASE}";
JS
echo "[config] API_BASE=${API_BASE:-<empty, using build default>}"
