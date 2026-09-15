import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "pole-photos")
HAZARD_BUCKET = os.environ.get("HAZARD_BUCKET", "hazard-photos")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def _upload_to_bucket(bucket: str, file_bytes: bytes, original_filename: str, content_type: str) -> str:
    ext = original_filename.split(".")[-1] if "." in original_filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"

    supabase.storage.from_(bucket).upload(
        filename,
        file_bytes,
        file_options={"content-type": content_type},
    )

    return supabase.storage.from_(bucket).get_public_url(filename)


def upload_photo(file_bytes: bytes, original_filename: str, content_type: str = "image/jpeg") -> str:
    """Upload a pole photo to Supabase Storage and return its public URL."""
    return _upload_to_bucket(SUPABASE_BUCKET, file_bytes, original_filename, content_type)


def upload_hazard_photo(file_bytes: bytes, original_filename: str, content_type: str = "image/jpeg") -> str:
    """Upload a citizen-submitted hazard photo to its own bucket and return its public URL."""
    return _upload_to_bucket(HAZARD_BUCKET, file_bytes, original_filename, content_type)


def insert_pole(
    pole_code: str,
    condition: str,
    accuracy_m: float,
    lat: float,
    lon: float,
    device_timestamp: str,
    photo_url: str,
    submitted_by: str | None = None,
    status: str = "pending_review",
):
    """Insert a new pole record into the poles table using a PostGIS WKT point."""
    payload = {
        "pole_code": pole_code,
        "condition": condition,
        "accuracy_m": accuracy_m,
        "device_timestamp": device_timestamp,
        "photo_url": photo_url,
        "submitted_by": submitted_by,
        "status": status,
        "geom": f"SRID=4326;POINT({lon} {lat})",
    }
    result = supabase.table("poles").insert(payload).execute()
    return result.data


def find_nearest_pole(lat: float, lon: float, max_dist_m: float = 200) -> dict | None:
    """
    Calls the nearest_pole() Postgres function (see database/hazards_schema.sql)
    to find the closest registered pole within max_dist_m meters.
    Returns None if nothing is within range.
    """
    result = supabase.rpc(
        "nearest_pole", {"in_lat": lat, "in_lon": lon, "max_dist_m": max_dist_m}
    ).execute()
    rows = result.data or []
    return rows[0] if rows else None


def find_nearby_poles(lat: float, lon: float, max_dist_m: float = 200, max_results: int = 5) -> list[dict]:
    """
    Calls the nearby_poles() Postgres function to get several candidate poles
    near a location, so a reporter can confirm which one they actually mean
    instead of the system silently guessing.
    """
    result = supabase.rpc(
        "nearby_poles",
        {"in_lat": lat, "in_lon": lon, "max_dist_m": max_dist_m, "max_results": max_results},
    ).execute()
    return result.data or []


def score_match_confidence(matched_distance_m: float | None, reporter_selected_pole_id: int | None, matched_pole_id: int | None) -> str:
    """
    Turns a raw distance (and whether the reporter's own pick agrees with the
    system's nearest-pole guess) into a simple confidence label a supervisor
    can triage by, without needing to read raw meter values.
    """
    if reporter_selected_pole_id is not None and matched_pole_id is not None:
        if reporter_selected_pole_id != matched_pole_id:
            return "conflicting"  # reporter picked a different pole than the nearest one -- review first
    if matched_distance_m is None:
        return "none"
    if matched_distance_m <= 15:
        return "high"
    if matched_distance_m <= 50:
        return "medium"
    return "low"


def insert_hazard(
    lat: float,
    lon: float,
    photo_url: str,
    ai_label: str,
    ai_confidence: float,
    ai_description: str,
    user_description: str | None,
    matched_pole_id: int | None,
    matched_distance_m: float | None,
    reporter_selected_pole_id: int | None = None,
    match_confidence: str | None = None,
    reporter_contact: str | None = None,
    status: str = "pending_review",
):
    """Insert a new citizen hazard report as a PostGIS point."""
    payload = {
        "photo_url": photo_url,
        "ai_label": ai_label,
        "ai_confidence": ai_confidence,
        "ai_description": ai_description,
        "user_description": user_description,
        "matched_pole_id": matched_pole_id,
        "matched_distance_m": matched_distance_m,
        "reporter_selected_pole_id": reporter_selected_pole_id,
        "match_confidence": match_confidence,
        "reporter_contact": reporter_contact,
        "status": status,
        "geom": f"SRID=4326;POINT({lon} {lat})",
    }
    result = supabase.table("hazard_reports").insert(payload).execute()
    return result.data


def list_hazards_geojson() -> dict:
    """Returns all hazard reports as a GeoJSON FeatureCollection for map display."""
    result = supabase.table("hazard_reports").select("*").execute()
    rows = result.data or []
    keys = [
        "id", "ai_label", "ai_confidence", "ai_description", "user_description",
        "status", "matched_pole_id", "matched_distance_m", "reporter_selected_pole_id",
        "match_confidence", "photo_url", "server_received_at",
    ]
    features = [
        {"type": "Feature", "geometry": r["geom"], "properties": {k: r.get(k) for k in keys}}
        for r in rows
        if r.get("geom")
    ]
    return {"type": "FeatureCollection", "features": features}


def list_assets_geojson() -> dict:
    """Returns all registered poles as a GeoJSON FeatureCollection for map display."""
    result = supabase.table("poles").select("*").execute()
    rows = result.data or []
    keys = ["id", "pole_code", "condition", "status", "photo_url"]
    features = [
        {"type": "Feature", "geometry": r["geom"], "properties": {k: r.get(k) for k in keys}}
        for r in rows
        if r.get("geom")
    ]
    return {"type": "FeatureCollection", "features": features}


def _points_to_polygon_wkt(points: list[dict]) -> str:
    """points is a list of {'lat': float, 'lon': float}, in walk/tap order."""
    coords = [(p["lon"], p["lat"]) for p in points]
    if coords[0] != coords[-1]:
        coords.append(coords[0])  # close the ring
    coord_str = ", ".join(f"{lon} {lat}" for lon, lat in coords)
    return f"SRID=4326;POLYGON(({coord_str}))"


def _points_to_linestring_wkt(points: list[dict]) -> str:
    coords = [(p["lon"], p["lat"]) for p in points]
    coord_str = ", ".join(f"{lon} {lat}" for lon, lat in coords)
    return f"SRID=4326;LINESTRING({coord_str})"


def insert_area(
    area_name: str,
    description: str | None,
    points: list[dict],
    submitted_by: str,
    status: str = "pending_review",
):
    """Insert a farm/land area as a closed polygon from an ordered list of points."""
    payload = {
        "area_name": area_name,
        "description": description,
        "submitted_by": submitted_by,
        "point_count": len(points),
        "status": status,
        "geom": _points_to_polygon_wkt(points),
    }
    result = supabase.table("farm_areas").insert(payload).execute()
    return result.data


def insert_line(
    line_name: str,
    line_type: str,
    description: str | None,
    points: list[dict],
    submitted_by: str,
    status: str = "pending_review",
):
    """Insert a cable/fiber route as a line from an ordered list of points."""
    payload = {
        "line_name": line_name,
        "line_type": line_type,
        "description": description,
        "submitted_by": submitted_by,
        "point_count": len(points),
        "status": status,
        "geom": _points_to_linestring_wkt(points),
    }
    result = supabase.table("cable_lines").insert(payload).execute()
    return result.data


def list_areas_geojson() -> dict:
    result = supabase.table("farm_areas").select("*").execute()
    rows = result.data or []
    keys = ["id", "area_name", "description", "submitted_by", "status", "point_count", "server_received_at"]
    features = [
        {"type": "Feature", "geometry": r["geom"], "properties": {k: r.get(k) for k in keys}}
        for r in rows
        if r.get("geom")
    ]
    return {"type": "FeatureCollection", "features": features}


def list_lines_geojson() -> dict:
    result = supabase.table("cable_lines").select("*").execute()
    rows = result.data or []
    keys = ["id", "line_name", "line_type", "description", "submitted_by", "status", "point_count", "server_received_at"]
    features = [
        {"type": "Feature", "geometry": r["geom"], "properties": {k: r.get(k) for k in keys}}
        for r in rows
        if r.get("geom")
    ]
    return {"type": "FeatureCollection", "features": features}


def list_my_submissions(email: str) -> list[dict]:
    """
    Returns a combined, newest-first list of everything one user has
    submitted across poles, farm areas, and cable/fiber lines -- used by
    the mobile app's History tab.
    """
    poles = supabase.table("poles").select("*").eq("submitted_by", email).execute().data or []
    areas = supabase.table("farm_areas").select("*").eq("submitted_by", email).execute().data or []
    lines = supabase.table("cable_lines").select("*").eq("submitted_by", email).execute().data or []

    items = []
    for r in poles:
        items.append({
            "type": "pole",
            "id": r["id"],
            "title": r.get("pole_code") or f"Pole #{r['id']}",
            "status": r.get("status"),
            "submitted_at": r.get("server_received_at"),
            "photo_url": r.get("photo_url"),
        })
    for r in areas:
        items.append({
            "type": "area",
            "id": r["id"],
            "title": r.get("area_name") or f"Area #{r['id']}",
            "status": r.get("status"),
            "submitted_at": r.get("server_received_at"),
            "photo_url": None,
        })
    for r in lines:
        items.append({
            "type": "line",
            "id": r["id"],
            "title": r.get("line_name") or f"Line #{r['id']}",
            "status": r.get("status"),
            "submitted_at": r.get("server_received_at"),
            "photo_url": None,
        })

    items.sort(key=lambda x: x["submitted_at"] or "", reverse=True)
    return items
