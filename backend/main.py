from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.poles import router as poles_router
from routes.hazards import router as hazards_router
from routes.areas import router as areas_router
from routes.lines import router as lines_router
from routes.history import router as history_router

app = FastAPI(title="Pole Mapper API", version="0.2.0")

# Allow the mobile app and the public hazard-report/map pages (any origin) to
# reach this API. Tighten allow_origins before real production use.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(poles_router)
app.include_router(hazards_router)
app.include_router(areas_router)
app.include_router(lines_router)
app.include_router(history_router)

# Serves backend/public/report.html and backend/public/map.html at
# /app/report.html and /app/map.html once deployed.
#app.mount("/app", StaticFiles(directory="public", html=True), name="public")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "pole-mapper-api"}
