from fastapi import Header, HTTPException
from services.supabase_client import supabase


async def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """
    FastAPI dependency that verifies the Supabase Auth access token sent by
    the mobile app as `Authorization: Bearer <token>`, and returns basic
    user info. Raises 401 if the token is missing or invalid.

    Usage in a route:
        @router.post("/some-endpoint")
        async def handler(user: dict = Depends(get_current_user)):
            ...
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        result = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

    user = getattr(result, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

    return {"id": user.id, "email": user.email}
