import json
from fastapi import APIRouter, Form, Depends, HTTPException
from services.supabase_client import insert_line, list_lines_geojson
from services.auth import get_current_user

router = APIRouter()

MIN_LINE_POINTS = 2


@router.post("/upload-line")
async def upload_line(
    line_name: str = Form(...),
    line_type: str = Form(...),  # 'cable' | 'fiber' | 'other'
    description: str = Form(default=""),
    points: str = Form(...),  # JSON string: [{"lat": .., "lon": ..}, ...]
    user: dict = Depends(get_current_user),
):
    """
    Submits a cable/fiber route as a line.
    `points` is a JSON-encoded array of {lat, lon}, in the order they were
    captured (either by walking the route or tapping on a map).
    Requires a logged-in user (Authorization: Bearer <token>).
    """
    try:
        parsed_points = json.loads(points)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="`points` must be valid JSON.")

    if not isinstance(parsed_points, list) or len(parsed_points) < MIN_LINE_POINTS:
        raise HTTPException(
            status_code=400,
            detail=f"A line needs at least {MIN_LINE_POINTS} points.",
        )

    result = insert_line(
        line_name=line_name,
        line_type=line_type,
        description=description or None,
        points=parsed_points,
        submitted_by=user["email"],
    )

    return {"status": "ok", "db_result": result}


@router.get("/lines")
def get_lines():
    """Returns all cable/fiber lines as GeoJSON, for map display."""
    return list_lines_geojson()
