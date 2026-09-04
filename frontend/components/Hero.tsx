import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden bg-[#2A1E17]">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1800&auto=format&fit=crop"
          alt="KK Store jewellery editorial"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1E17] via-[#2A1E17]/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-20 md:px-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#B08D57]">
              Everyday Jewellery
            </span>
          </div>

          <h1 className="font-[var(--font-playfair)] text-4xl font-normal leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Shine That <br />
            <span className="italic text-[#B08D57]">Never Fades.</span>
          </h1>

          <p className="max-w-lg text-sm font-light leading-relaxed text-[#FAF7F2]/80 md:text-base">
            Anti-tarnish, skin-friendly jewellery made for real life — wear it
            to class, to work, to everywhere in between.
          </p>

          <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center">
            <Link
              href="/products"
              className="flex items-center justify-center gap-3 bg-[#B08D57] px-10 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2A1E17] shadow-lg transition-all duration-300 hover:bg-[#C9A96E]"
            >
              Shop Bestsellers
              <ArrowRight size={14} strokeWidth={2} />
            </Link>

            <Link
              href="#philosophy"
              className="border border-[#B08D57]/60 px-8 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08D57] transition-all duration-300 hover:bg-[#B08D57] hover:text-[#2A1E17]"
            >
              Our Philosophy
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="relative aspect-[3/4] w-full border border-[#B08D57]/40 p-4">
            <div className="relative h-full w-full">
              <Image
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
                alt="KK Store jewellery close-up"
                fill
                sizes="(min-width: 1024px) 470px, 0px"
                className="object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[#FAF7F2]/50">
        <span className="text-[9px] uppercase tracking-[0.35em] text-[#B08D57]">
          Scroll
        </span>
        <div className="h-10 w-[1px] animate-pulse bg-gradient-to-b from-[#B08D57] to-transparent" />
      </div>
    </section>
  );
}