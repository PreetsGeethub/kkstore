export type CartItem = {
  productId: string;
  variantId: string; // NEW — the actual variant to add server-side
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  maxStock: number;
};