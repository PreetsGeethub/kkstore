from mcp.server import MCPServer
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings
import asyncio
import os

import httpx
import jwt
from jwt import PyJWKClient
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000").rstrip("/")
AUTHKIT_DOMAIN = os.getenv("AUTHKIT_DOMAIN", "").rstrip("/")
MCP_RESOURCE_URL = os.getenv("MCP_RESOURCE_URL", "").rstrip("/")

if not AUTHKIT_DOMAIN or not MCP_RESOURCE_URL:
    raise RuntimeError(
        "AUTHKIT_DOMAIN and MCP_RESOURCE_URL must be configured. "
        "Refusing to start the MCP server without authentication settings."
    )

if not AUTHKIT_DOMAIN.startswith("https://") or not MCP_RESOURCE_URL.startswith("https://"):
    raise RuntimeError("AUTHKIT_DOMAIN and MCP_RESOURCE_URL must use HTTPS.")

JWKS_CLIENT = PyJWKClient(f"{AUTHKIT_DOMAIN}/oauth2/jwks")
HTTP_TIMEOUT_SECONDS = 10.0


class WorkOSTokenVerifier(TokenVerifier):
    """Verify WorkOS AuthKit access tokens for this MCP resource."""

    async def verify_token(self, token: str) -> AccessToken | None:
        try:
            signing_key = await asyncio.to_thread(
                JWKS_CLIENT.get_signing_key_from_jwt, token
            )
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=AUTHKIT_DOMAIN,
                audience=MCP_RESOURCE_URL,
                options={"require": ["exp", "iss", "aud", "sub", "client_id"]},
            )
        except Exception:
            # Fail closed for invalid tokens and JWKS/network failures.
            return None

        audience = claims.get("aud")
        if isinstance(audience, list):
            resource = MCP_RESOURCE_URL if MCP_RESOURCE_URL in audience else None
        elif isinstance(audience, str):
            resource = audience
        else:
            resource = None

        if resource != MCP_RESOURCE_URL:
            return None

        scope_claim = claims.get("scope", "")
        scopes = scope_claim.split() if isinstance(scope_claim, str) else []

        return AccessToken(
            token=token,
            client_id=claims["client_id"],
            scopes=scopes,
            expires_at=int(claims["exp"]),
            resource=resource,
            subject=claims["sub"],
            claims=claims,
        )


mcp = MCPServer(
    "KK Store MCP Server",
    token_verifier=WorkOSTokenVerifier(),
    auth=AuthSettings(
        issuer_url=AUTHKIT_DOMAIN,
        resource_server_url=MCP_RESOURCE_URL,
        validate_token_resource=True,
    ),
)


@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b


@mcp.tool()
async def search_products(
    query: str = "",
    max_price: float | None = None,
    color: str | None = None,
) -> dict:
    """Search KK Store products by keyword, maximum price, or color."""
    params = {"page": 1, "limit": 10}

    if query:
        params["search"] = query
    if max_price is not None:
        params["maxPrice"] = max_price
    if color:
        params["color"] = color

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        response = await client.get(
            f"{BACKEND_URL}/api/v1/products",
            params=params,
        )
        response.raise_for_status()

    payload = response.json()
    data = payload["data"]
    products = [
        {
            "id": product["id"],
            "name": product["name"],
            "category": product["category"]["name"],
            "price": product["startingPrice"],
            "stock": product["totalStock"],
            "image_url": product["thumbnail"],
        }
        for product in data["products"]
    ]

    return {"products": products, "total": data["pagination"]["total"]}


@mcp.tool()
async def get_product_details(product_id: str) -> dict:
    """Get detailed information about a KK Store product using its product ID."""
    if not product_id or not product_id.strip():
        return {
            "error": True,
            "error_type": "invalid_input",
            "message": "product_id must not be empty.",
        }

    product_id = product_id.strip()

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
            response = await client.get(
                f"{BACKEND_URL}/api/v1/products/{product_id}"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status == 404:
            return {
                "error": True,
                "error_type": "not_found",
                "message": "The requested product was not found.",
            }
        if status == 400:
            return {
                "error": True,
                "error_type": "invalid_request",
                "message": "The backend rejected the product request.",
            }
        if status >= 500:
            return {
                "error": True,
                "error_type": "backend_failure",
                "message": "The product service encountered a server error.",
            }
        return {
            "error": True,
            "error_type": "http_error",
            "message": f"The product service returned HTTP {status}.",
        }

    except httpx.TimeoutException:
        return {
            "error": True,
            "error_type": "timeout",
            "message": "The product service took too long to respond.",
        }

    except httpx.RequestError:
        return {
            "error": True,
            "error_type": "connection_error",
            "message": "Could not connect to the product service.",
        }


@mcp.resource("greeting://{name}")
def greeting(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"


@mcp.prompt()
def summarize(text: str) -> str:
    """Summarize a piece of text in one sentence."""
    return f"Summarize the following text in one sentence:\n\n{text}"


if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
