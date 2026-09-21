export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  category: { id: string; name: string };
  thumbnail: string | null;
  startingPrice: number;
  comparePrice?: number | null;
  totalStock: number;
};
  
  export type ProductVariant = {
    id: string;
    sku: string;
    color: string;
    size: string;
    price: number;
    comparePrice?: number;
    stock: number;
  };
  
  export type ProductImage = {
    imageUrl: string;
    sortOrder: number;
  };
  
  export type ProductReview = {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string };
  };
  
  export type ApiProduct = {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    category: { id: string; name: string };
    material: string;
    careInstructions: string;
    gifUrl?: string;
    isAntiTarnish: boolean;
    isWaterproof: boolean;
    isSkinFriendly: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    images: ProductImage[];
    variants: ProductVariant[];
    reviews: ProductReview[];
  };