import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productApi";
import ProductDetail from "@/components/ProductDetail";
import ProductReviews from "@/components/ProductReviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <>
      <ProductDetail product={product} />
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <ProductReviews productId={product.id} initialReviews={product.reviews ?? []} />
      </div>
    </>
  );
}