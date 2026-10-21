from pydantic import BaseModel, Field


class ProductVariant(BaseModel):
    color: str
    size: str
    price: float
    stock: int


class ProductFeatures(BaseModel):
    anti_tarnish: bool
    waterproof: bool
    skin_friendly: bool


class ProductDetails(BaseModel):
    id: str
    name: str
    description: str
    material: str
    category: str
    variants: list[ProductVariant]
    features: ProductFeatures
    is_new_arrival: bool
    image_url: str | None = None
    
class ProductSearchItem(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock: int
    image_url: str | None = None
    score: float | None = None


class ProductSearchResult(BaseModel):
    products: list[ProductSearchItem]
    total: int
class ToolError(BaseModel):
    success: bool = False
    error_code: str
    message: str
class ProductSearchRequest(BaseModel):
    query: str
    max_price: float | None = None
    color: str | None = None
class ProductDetailsRequest(BaseModel):
    product_id: str
class SemanticProductSearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        description=(
            "The user's actual product intent. Preserve the product/category "
            "words the user mentions. Do not invent unrelated product types."
        ),
    )
    max_price: float | None = Field(
        default=None,
        gt=0,
    )
    waterproof: bool | None = None
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
    )