import type { ProductListItem, ApiProduct } from "./types";
import type { Product } from "@/components/ProductCard";

export function listItemToCardProduct(item: ProductListItem): Product {
  const hasDiscount = item.comparePrice != null && item.comparePrice > item.startingPrice;
  return {
    id: item.id,
    name: item.name,
    price: hasDiscount ? item.comparePrice! : item.startingPrice,
    discountPrice: hasDiscount ? item.startingPrice : undefined,
    image: item.thumbnail ?? "/placeholder-product.jpg",
    isNew: item.isNewArrival,
    isBestseller: item.isBestSeller,
  };
}

export function toCardProduct(apiProduct: ApiProduct): Product {
  const sortedImages = [...apiProduct.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const cheapestVariant = apiProduct.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    apiProduct.variants[0]
  );
  const hasDiscount =
    cheapestVariant?.comparePrice !== undefined && cheapestVariant.comparePrice > cheapestVariant.price;

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: hasDiscount ? cheapestVariant.comparePrice! : cheapestVariant?.price ?? 0,
    discountPrice: hasDiscount ? cheapestVariant.price : undefined,
    image: sortedImages[0]?.imageUrl ?? "/placeholder-product.jpg",
    hoverImage: sortedImages[1]?.imageUrl,
    isNew: apiProduct.isNewArrival,
    isBestseller: apiProduct.isBestSeller,
  };
}