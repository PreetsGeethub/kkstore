"""Resolve authenticated customer identity for AI conversation ownership."""

import httpx
from fastapi import HTTPException

from app.config import BACKEND_URL, HTTP_TIMEOUT_SECONDS


async def resolve_authenticated_owner(access_token: str | None) -> str | None:
    """Return a trusted customer owner key, or None when no login cookie exists.

    The AI service deliberately asks the existing backend to validate the token.
    It does not decode or trust JWT claims itself.
    """
    if not access_token:
        return None

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
            response = await client.get(
                f"{BACKEND_URL}/api/v1/auth/me",
                cookies={"accessToken": access_token},
            )
    except httpx.HTTPError as exc:
        # Do not silently downgrade a supplied login token to a guest session
        # when the identity provider cannot be reached.
        raise HTTPException(
            status_code=503,
            detail="Authentication is temporarily unavailable. Please retry.",
        ) from exc

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please sign in again.",
        )

    try:
        response.raise_for_status()
        payload = response.json()
        user = payload.get("data") if isinstance(payload, dict) else None
        user_id = user.get("id") if isinstance(user, dict) else None
    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=503,
            detail="Could not verify your identity. Please retry.",
        ) from None

    if not isinstance(user_id, str) or not user_id.strip():
        raise HTTPException(
            status_code=503,
            detail="The authentication service returned an invalid identity.",
        )

    return f"user:{user_id}"
