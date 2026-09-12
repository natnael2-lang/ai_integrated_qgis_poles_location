import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.supabase_client import upload_photo, insert_pole

router = APIRouter()

MAX_ACCURACY_METERS = float(os.environ.get("MAX_ACCURACY_METERS", 50))


@router.post("/upload-pole")
async def upload_pole(
    lat: float = Form(...),
    lon: float = Form(...),
    accuracy_m: float = Form(...),
    pole_code: str = Form(...),
    condition: str = Form(...),
    device_timestamp: str = Form(...),
    submitted_by: str = Form(default="test_user"),
    photo: UploadFile = File(...),
):
    # --- basic rule-based validation ---
    if accuracy_m > MAX_ACCURACY_METERS:
        status = "flagged"
    else:
        status = "pending_review"

    if not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    contents = await photo.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty photo upload.")

    # --- upload photo to Supabase Storage ---
    photo_url = upload_photo(contents, photo.filename, photo.content_type)

    # --- insert record into PostGIS-enabled poles table ---
    result = insert_pole(
        pole_code=pole_code,
        condition=condition,
        accuracy_m=accuracy_m,
        lat=lat,
        lon=lon,
        device_timestamp=device_timestamp,
        photo_url=photo_url,
        submitted_by=submitted_by,
        status=status,
    )

    return {
        "status": "ok",
        "record_status": status,
        "photo_url": photo_url,
        "db_result": result,
    }
