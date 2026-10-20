import os
import asyncio
from types import SimpleNamespace

# Test-only configuration. No real WorkOS credentials are needed.
os.environ["AUTHKIT_DOMAIN"] = "https://authkit.example.test"
os.environ["MCP_RESOURCE_URL"] = "https://mcp.example.test/mcp"
os.environ["ALLOWED_WORKOS_SUBJECTS"] = "user_test"

import server


def mock_valid_token(monkeypatch, subject):
    """Mock token verification inputs for a unit test."""
    claims = {
        "exp": 4102444800,
        "iss": server.AUTHKIT_DOMAIN,
        "aud": server.MCP_RESOURCE_URL,
        "sub": subject,
        "client_id": "test-client",
        "scope": "products:read",
    }

    monkeypatch.setattr(
        server.JWKS_CLIENT,
        "get_signing_key_from_jwt",
        lambda token: SimpleNamespace(key="mock-signing-key"),
    )

    monkeypatch.setattr(
        server.jwt,
        "decode",
        lambda *args, **kwargs: claims,
    )


def test_approved_user_is_accepted(monkeypatch):
    monkeypatch.setattr(
        server,
        "ALLOWED_WORKOS_SUBJECTS",
        frozenset({"user_approved"}),
    )
    mock_valid_token(monkeypatch, "user_approved")

    result = asyncio.run(
        server.WorkOSTokenVerifier().verify_token("fake-test-token")
    )

    assert result is not None
    assert result.subject == "user_approved"


def test_unapproved_user_is_rejected(monkeypatch):
    monkeypatch.setattr(
        server,
        "ALLOWED_WORKOS_SUBJECTS",
        frozenset({"user_approved"}),
    )
    mock_valid_token(monkeypatch, "user_unapproved")

    result = asyncio.run(
        server.WorkOSTokenVerifier().verify_token("fake-test-token")
    )

    assert result is None



def test_search_products_maps_variant_price_and_stock(monkeypatch):
    import asyncio

    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "data": {
                    "products": [
                        {
                            "id": "product_123",
                            "name": "Silver Ring",
                            "category": {"name": "Rings"},
                            "thumbnail": "https://example.test/ring.jpg",
                            "variants": [
                                {"price": "1400", "stock": 2},
                                {"price": "1600", "stock": 3},
                            ],
                        }
                    ],
                    "pagination": {"total": 1},
                }
            }

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url, params=None):
            assert url == f"{server.BACKEND_URL}/api/v1/products"
            assert params == {
                "page": 1,
                "limit": 10,
                "search": "ring",
                "maxPrice": 2000,
                "color": "silver",
            }
            return FakeResponse()

    monkeypatch.setattr(
        server.httpx,
        "AsyncClient",
        FakeAsyncClient,
    )

    result = asyncio.run(
        server.search_products(
            query="ring",
            max_price=2000,
            color="silver",
        )
    )

    assert result["total"] == 1
    assert len(result["products"]) == 1

    product = result["products"][0]

    assert product["name"] == "Silver Ring"
    assert product["category"] == "Rings"
    assert product["price"] == 1400.0
    assert product["stock"] == 5
    assert product["image_url"] == "https://example.test/ring.jpg"

def test_get_product_details_returns_backend_data(monkeypatch):
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "data": {
                    "id": "product_123",
                    "name": "Silver Ring",
                    "description": "A silver ring",
                    "price": 1400,
                }
            }

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url):
            assert url == (
                f"{server.BACKEND_URL}/api/v1/products/product_123"
            )
            return FakeResponse()

    monkeypatch.setattr(
        server.httpx,
        "AsyncClient",
        FakeAsyncClient,
    )

    result = asyncio.run(
        server.get_product_details("product_123")
    )

    assert result["data"]["id"] == "product_123"
    assert result["data"]["name"] == "Silver Ring"
    assert result["data"]["price"] == 1400

def test_get_product_details_handles_missing_product(monkeypatch):
    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url):
            assert url.endswith("/api/v1/products/missing_product")

            request = server.httpx.Request("GET", url)
            return server.httpx.Response(404, request=request)

    monkeypatch.setattr(
        server.httpx,
        "AsyncClient",
        FakeAsyncClient,
    )

    result = asyncio.run(
        server.get_product_details("missing_product")
    )

    assert result["error"] is True
    assert result["error_type"] == "not_found"
    assert result["message"] == "The requested product was not found."

def test_get_product_details_handles_timeout(monkeypatch):
    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def get(self, url):
            raise server.httpx.TimeoutException("Test timeout")

    monkeypatch.setattr(
        server.httpx,
        "AsyncClient",
        FakeAsyncClient,
    )

    result = asyncio.run(
        server.get_product_details("product_123")
    )

    assert result["error"] is True
    assert result["error_type"] == "timeout"
    assert result["message"] == (
        "The product service took too long to respond."
    )

def test_get_product_details_rejects_empty_id():
    result = asyncio.run(
        server.get_product_details("   ")
    )

    assert result["error"] is True
    assert result["error_type"] == "invalid_input"
    assert result["message"] == "product_id must not be empty."
