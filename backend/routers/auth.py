from typing import List
from fastapi import APIRouter, Depends
from backend.schemas import LoginRequest, LoginResponse, DemoAccountItem
from backend.auth import (
    authenticate_credentials,
    list_demo_accounts,
    verify_bearer_token,
    AuthenticatedUser
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.get("/demo-accounts", response_model=List[DemoAccountItem])
def get_demo_accounts():
    """Published dummy logins for SIH evaluation and hierarchical role walkthroughs."""
    return list_demo_accounts()

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    token, user = authenticate_credentials(payload.username, payload.password)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.model_dump(),
    }

@router.get("/me")
def auth_me(current_user: AuthenticatedUser = Depends(verify_bearer_token)):
    return current_user.model_dump()
