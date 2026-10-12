import httpx


from app.schemas.product import ProductDetails,ProductSearchItem, ProductSearchResult

BACKEND_URL = "http://localhost:5000"






async def search_products(
    query: str = "",
    max_price: float | None = None,
    color: str | None = None,
):
    params = {}

    if query:
        params["search"] = query

    if max_price is not None:
        params["maxPrice"] = max_price

    if color:
        params["color"] = color

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BACKEND_URL}/api/v1/products",
            params=params
        )

    response.raise_for_status()

    data = response.json()["data"]

    products = [
        ProductSearchItem(
            id=product["id"],
            name=product["name"],
            category=product["category"]["name"],
            price=product["startingPrice"],
            stock=product["totalStock"],
            image_url=product["thumbnail"],
        )
        for product in data["products"]
    ]

    result = ProductSearchResult(
        products=products,
        total=data["pagination"]["total"],
    )

    return result.model_dump()


async def get_product_details(product_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BACKEND_URL}/api/v1/products/{product_id}"
        )

    response.raise_for_status()

    data = response.json()["data"]

    product = ProductDetails(
        id=data["id"],
        name=data["name"],
        description=data["description"],
        material=data["material"],
        category=data["category"]["name"],
        variants=[
            {
                "color": variant["color"],
                "size": variant["size"],
                "price": variant["price"],
                "stock": variant["stock"],
            }
            for variant in data["variants"]
        ],
        features={
            "anti_tarnish": data["isAntiTarnish"],
            "waterproof": data["isWaterproof"],
            "skin_friendly": data["isSkinFriendly"],
        },
        is_new_arrival=data["isNewArrival"],
        image_url=(
            data["images"][0]["imageUrl"]
            if data["images"]
            else None
        ),
    )

    return product.model_dump()