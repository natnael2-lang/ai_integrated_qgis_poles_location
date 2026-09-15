import json
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from services.supabase_client import (
    upload_hazard_photo, insert_hazard, find_nearby_poles, score_match_confidence
)
from services.auth import get_current_user

router = APIRouter()


@router.post("/upload-hazard")
async def upload_hazard(
    lat: float = Form(...),
    lon: float = Form(...),
    ai_label: str = Form(...),
    ai_confidence: float = Form(...),
    ai_description: str = Form(...),
    user_description: str = Form(default=""),
    reporter_selected_pole_id: int = Form(default=None),
    reporter_contact: str = Form(default=""),
    photo: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    contents = await photo.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty photo upload.")

    photo_url = upload_hazard_photo(contents, photo.filename, photo.content_type)

    nearest = find_nearby_poles(lat, lon, max_results=1)
    matched_pole_id = nearest[0]["id"] if nearest else None
    matched_distance_m = nearest[0]["distance_m"] if nearest else None

    confidence = score_match_confidence(matched_distance_m, reporter_selected_pole_id, matched_pole_id)

    result = insert_hazard(
        lat=lat,
        lon=lon,
        photo_url=photo_url,
        ai_label=ai_label,
        ai_confidence=ai_confidence,
        ai_description=ai_description,
        user_description=user_description or None,
        matched_pole_id=matched_pole_id,
        matched_distance_m=matched_distance_m,
        reporter_selected_pole_id=reporter_selected_pole_id,
        match_confidence=confidence,
        reporter_contact=reporter_contact or None,
    )

    return {"status": "ok", "match_confidence": confidence, "db_result": result}


@router.get("/hazards")
def get_hazards():
    from services.supabase_client import list_hazards_geojson
    return list_hazards_geojson()