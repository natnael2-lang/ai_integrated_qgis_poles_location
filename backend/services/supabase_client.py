import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "pole-photos")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_photo(file_bytes: bytes, original_filename: str, content_type: str = "image/jpeg") -> str:
    """Upload photo bytes to Supabase Storage and return its public URL."""
    ext = original_filename.split(".")[-1] if "." in original_filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"

    supabase.storage.from_(SUPABASE_BUCKET).upload(
        filename,
        file_bytes,
        file_options={"content-type": content_type},
    )

    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
    return public_url


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
