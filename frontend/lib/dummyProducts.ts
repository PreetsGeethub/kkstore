import type { ApiProduct } from "./types";

export const dummyProducts: ApiProduct[] = [
  {
    id: "dummy-1",
    name: "Aria Layered Necklace",
    description: "A delicate layered necklace crafted from premium anti-tarnish stainless steel, designed for everyday wear.",
    categoryId: "necklaces",
    material: "Stainless Steel",
    careInstructions: "Wipe with a soft, dry cloth. Avoid contact with perfume and water.",
    gifUrl: "https://example.com/demo.gif",
    isAntiTarnish: true,
    isWaterproof: true,
    isSkinFriendly: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop", sortOrder: 0 },
      { imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop", sortOrder: 1 }
    ],
    variants: [
      { sku: "NK001-GOLD", color: "Gold", size: "Free", price: 649, comparePrice: 899, stock: 20 },
      { sku: "NK001-SILVER", color: "Silver", size: "Free", price: 599, comparePrice: 849, stock: 3 },
      { sku: "NK001-ROSEGOLD", color: "Rose Gold", size: "Free", price: 649, comparePrice: 899, stock: 0 }
    ]
  },
  {
    id: "dummy-2",
    name: "Elle Stackable Ring",
    description: "A minimal stackable ring that pairs beautifully alone or mixed with your existing stack.",
    categoryId: "rings",
    material: "Stainless Steel",
    careInstructions: "Remove before swimming or showering for extended shine.",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: false,
    isSkinFriendly: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop", sortOrder: 0 }
    ],
    variants: [
      { sku: "RG001-GOLD-6", color: "Gold", size: "6", price: 399, comparePrice: 399, stock: 12 },
      { sku: "RG001-GOLD-7", color: "Gold", size: "7", price: 399, comparePrice: 399, stock: 8 },
      { sku: "RG001-SILVER-6", color: "Silver", size: "6", price: 379, comparePrice: 379, stock: 15 },
      { sku: "RG001-SILVER-7", color: "Silver", size: "7", price: 379, comparePrice: 379, stock: 0 }
    ]
  },
  {
    id: "dummy-3",
    name: "Mira Hoop Earrings",
    description: "Lightweight everyday hoops that will not tug or irritate sensitive ears.",
    categoryId: "earrings",
    material: "Stainless Steel",
    careInstructions: "Wipe clean after wear, store in a dry pouch.",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: true,
    isSkinFriendly: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop", sortOrder: 0 }
    ],
    variants: [
      { sku: "ER001-GOLD", color: "Gold", size: "Free", price: 449, comparePrice: 549, stock: 18 },
      { sku: "ER001-SILVER", color: "Silver", size: "Free", price: 429, comparePrice: 529, stock: 10 }
    ]
  },
  {
    id: "dummy-4",
    name: "Noor Chain Bracelet",
    description: "A simple, stackable chain bracelet built for daily wear.",
    categoryId: "bracelets",
    material: "Stainless Steel",
    careInstructions: "Avoid harsh chemicals and prolonged water exposure.",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: true,
    isSkinFriendly: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop", sortOrder: 0 }
    ],
    variants: [
      { sku: "BR001-GOLD", color: "Gold", size: "Free", price: 559, comparePrice: 699, stock: 14 }
    ]
  },
  {
    id: "dummy-5",
    name: "Rae Anklet",
    description: "A delicate everyday anklet with a subtle charm detail.",
    categoryId: "anklets",
    material: "Stainless Steel",
    careInstructions: "Remove before showering for extended shine.",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: false,
    isSkinFriendly: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1602752250015-52934bc45613?q=80&w=800&auto=format&fit=crop", sortOrder: 0 }
    ],
    variants: [
      { sku: "AK001-SILVER", color: "Silver", size: "Free", price: 349, comparePrice: 349, stock: 22 }
    ]
  },
  {
    id: "dummy-6",
    name: "Bloom Jewellery Set",
    description: "A coordinated necklace and earring set, perfect for gifting or special occasions.",
    categoryId: "jewellery-sets",
    material: "Stainless Steel",
    careInstructions: "Store pieces separately in a soft pouch to avoid scratching.",
    gifUrl: "",
    isAntiTarnish: true,
    isWaterproof: true,
    isSkinFriendly: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    images: [
      { imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop", sortOrder: 0 }
    ],
    variants: [
      { sku: "SET001-GOLD", color: "Gold", size: "Free", price: 949, comparePrice: 1199, stock: 6 }
    ]
  }
];
