from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.poles import router as poles_router

app = FastAPI(title="Pole Mapper API", version="0.1.0")

# Allow the mobile app (Expo dev client / any origin during testing) to reach this API.
# Tighten allow_origins before real production use.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(poles_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "pole-mapper-api"}
