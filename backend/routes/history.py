from fastapi import APIRouter, Depends
from services.supabase_client import list_my_submissions
from services.auth import get_current_user

router = APIRouter()


@router.get("/my-submissions")
def my_submissions(user: dict = Depends(get_current_user)):
    """Combined, newest-first list of the logged-in user's poles, areas, and lines."""
    return {"items": list_my_submissions(user["email"])}
