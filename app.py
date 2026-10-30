import uvicorn

if __name__ == "__main__":
    print("==================================================================")
    print(" 🌱 CropHealth EWS: AI & Micro-Climate Disease Forecasting Engine")
    print("    NISR 2026 Big Data Hackathon | Track 1")
    print("==================================================================")
    print("[*] Starting FastAPI Server on http://0.0.0.0:8000")
    print("[*] Interactive Swagger API Docs: http://127.0.0.1:8000/docs")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
