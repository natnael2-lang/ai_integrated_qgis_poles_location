import json
from fastapi import APIRouter, Form, Depends, HTTPException
from services.supabase_client import insert_area, list_areas_geojson
from services.auth import get_current_user

router = APIRouter()

MIN_POLYGON_POINTS = 3


@router.post("/upload-area")
async def upload_area(
    area_name: str = Form(...),
    description: str = Form(default=""),
    points: str = Form(...),  # JSON string: [{"lat": .., "lon": ..}, ...]
    user: dict = Depends(get_current_user),
):
    """
    Submits a farm/land area boundary as a closed polygon.
    `points` is a JSON-encoded array of {lat, lon}, in the order they were
    captured (either by walking the perimeter or tapping on a map).
    Requires a logged-in user (Authorization: Bearer <token>).
    """
    try:
        parsed_points = json.loads(points)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="`points` must be valid JSON.")

    if not isinstance(parsed_points, list) or len(parsed_points) < MIN_POLYGON_POINTS:
        raise HTTPException(
            status_code=400,
            detail=f"An area needs at least {MIN_POLYGON_POINTS} points to form a polygon.",
        )

    result = insert_area(
        area_name=area_name,
        description=description or None,
        points=parsed_points,
        submitted_by=user["email"],
    )

    return {"status": "ok", "db_result": result}


@router.get("/areas")
def get_areas():
    """Returns all farm/land areas as GeoJSON, for map display."""
    return list_areas_geojson()
