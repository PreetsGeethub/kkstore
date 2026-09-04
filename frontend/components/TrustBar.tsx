// components/TrustBar.tsx
import { ShieldCheck, Gem, Lock, Truck } from "lucide-react";

const trustPoints = [
  {
    icon: Gem,
    title: "Anti-Tarnish",
    description: "Stays shiny, wear it every day",
  },
  {
    icon: ShieldCheck,
    title: "Premium Stainless Steel",
    description: "Skin-friendly & built to last",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "UPI, cards & net banking",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free delivery above ₹499",
  },
];

export default function TrustBar() {
  return (
    <section className="border-t border-[#B08D57]/20 bg-[#2A1E17] py-10 text-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 divide-[#B08D57]/20 px-6 md:grid-cols-4 md:divide-x md:px-12">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <div
              key={point.title}
              className="flex items-center space-x-4 pt-4 md:px-4 md:pt-0"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-[#B08D57]/40 text-[#B08D57]">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {point.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-[#FAF7F2]/60">
                  {point.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}