import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CategoryCardProps = {
  name: string;
  href: string;
  image: string;
  priority?: boolean;
};

export default function CategoryCard({
  name,
  href,
  image,
  priority = false,
}: CategoryCardProps) {
  return (
    <Link href={href} className="group relative block">
      {/* Gold offset frame — appears on hover */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 border border-[#B08D57]/0 transition-all duration-300 group-hover:border-[#B08D57]/60" />

      <div className="relative aspect-[3/4] overflow-hidden bg-[#E8D8C5]">
        <Image
          src={image}
          alt={name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Base gradient — always visible for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E17]/70 via-[#2A1E17]/10 to-transparent" />

        {/* Darkens further on hover for contrast with reveal */}
        <div className="absolute inset-0 bg-[#2A1E17]/0 transition-colors duration-300 group-hover:bg-[#2A1E17]/20" />

        {/* Arrow button — top right, reveals on hover */}
        <div className="absolute right-3 top-3 flex h-9 w-9 -translate-y-2 items-center justify-center border border-white/40 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={15} strokeWidth={1.5} />
        </div>

        {/* Category name + reveal CTA — bottom left */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="font-[var(--font-playfair)] text-lg text-white sm:text-xl">
            {name}
          </p>

          <div className="mt-1 flex h-0 items-center gap-1.5 overflow-hidden opacity-0 transition-all duration-300 group-hover:h-5 group-hover:opacity-100">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#B08D57]">
              Shop Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}