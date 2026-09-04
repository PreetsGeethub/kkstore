// components/Philosophy.tsx
import Image from "next/image";
import { Gem, Droplets, Wallet } from "lucide-react";

const pillars = [
  {
    icon: Gem,
    title: "Anti-Tarnish, Always",
    description:
      "Premium stainless steel that keeps its shine — no fading, no discoloration, wear it every single day.",
  },
  {
    icon: Droplets,
    title: "Built for Real Life",
    description:
      "Waterproof and sweat-resistant where it matters, so it keeps up with your day, not just your outfit.",
  },
  {
    icon: Wallet,
    title: "Premium, Not Pricey",
    description:
      "Elegant design shouldn't come with a luxury markup. Quality pieces, honest prices.",
  },
];

export default function Philosophy() {
  return (
    <section id="philosophy" className="scroll-mt-20 bg-[#FFFFFF] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left image */}
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#E8D8C5]">
              <Image
                src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=900&auto=format&fit=crop"
                alt="KK Store craftsmanship"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* Offset frame, consistent with Hero/Category treatment */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full border border-[#B08D57]/40 sm:-bottom-6 sm:-right-6" />
          </div>

          {/* Right content */}
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#B08D57]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
                Our Philosophy
              </span>
            </div>

            <h2 className="max-w-xl font-[var(--font-playfair)] text-3xl leading-tight text-[#2A1E17] sm:text-4xl md:text-5xl">
              Jewellery that keeps up with your everyday.
            </h2>

            <p className="mt-6 max-w-lg font-sans text-sm font-light leading-7 text-[#4A4A4A] md:text-base">
              We started KK Store on a simple idea: you shouldn&apos;t have to
              choose between looking good and living your life. Every piece is
              crafted from anti-tarnish stainless steel — designed to survive
              your commute, your gym bag, and your late nights, without ever
              losing its shine.
            </p>

            {/* Pillars */}
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title}>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center border border-[#B08D57]/40 text-[#B08D57]">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2A1E17]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 font-sans text-xs leading-5 text-[#4A4A4A]">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}