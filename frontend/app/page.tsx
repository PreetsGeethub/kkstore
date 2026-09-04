// app/page.tsx
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import ShopByCategory from "@/components/ShopByCategory";
import ProductShowcase from "@/components/ProductShowcase";
import Philosophy from "@/components/Philosophy";
import Testimonials from "@/components/Testimonials";
import InstagramGallery from "@/components/InstagramGallery";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ShopByCategory />
      <ProductShowcase />
      <Philosophy />
      <Testimonials />
      <InstagramGallery />
      <FAQ />
      <Newsletter />
    </main>
  );
}