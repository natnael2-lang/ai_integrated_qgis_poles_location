from pydantic import BaseModel
from typing import Optional


class PoleSubmission(BaseModel):
    """Schema describing the non-file fields sent alongside a pole photo upload.

    FastAPI reads these from multipart Form fields directly in the route,
    this class documents the shape and can be reused for validation elsewhere
    (e.g. a JSON-only endpoint or internal testing).
    """
    pole_code: str
    condition: str
    lat: float
    lon: float
    accuracy_m: float
    device_timestamp: str
    submitted_by: Optional[str] = None


class PoleResponse(BaseModel):
    status: str
    id: Optional[int] = None
    photo_url: Optional[str] = None
    message: Optional[str] = None
