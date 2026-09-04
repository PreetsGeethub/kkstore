import { Star, BadgeCheck } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  product?: string;
};

const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya R.",
    location: "Delhi",
    rating: 5,
    review:
      "I wear my necklace every day — gym, college, everywhere — and it still looks brand new. Zero tarnishing, genuinely impressed.",
    product: "Aria Layered Necklace",
  },
  {
    id: "t2",
    name: "Priya S.",
    location: "Bangalore",
    rating: 5,
    review:
      "Finally jewellery that doesn't turn my skin green after a week. The quality feels way above what I paid for.",
    product: "Mira Hoop Earrings",
  },
  {
    id: "t3",
    name: "Kavya M.",
    location: "Mumbai",
    rating: 4,
    review:
      "Delivery was quick and the packaging felt premium. The rose gold rings are my new everyday stack.",
    product: "Elle Stackable Ring",
  },
  {
    id: "t4",
    name: "Sneha T.",
    location: "Pune",
    rating: 5,
    review:
      "Bought the jewellery set for a wedding and got so many compliments. Doesn't look 'affordable' at all — looks expensive.",
    product: "Bloom Jewellery Set",
  },
  {
    id: "t5",
    name: "Riya K.",
    location: "Hyderabad",
    rating: 5,
    review:
      "I'm someone with sensitive skin and this is the first jewellery brand that hasn't irritated me. Repeat customer now.",
    product: "Noor Chain Bracelet",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <section className="bg-[#2A1E17] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              Loved by Thousands
            </span>
            <span className="h-[1px] w-8 bg-[#B08D57]" />
          </div>
          <h2 className="font-[var(--font-playfair)] text-3xl text-white sm:text-4xl md:text-5xl">
            What Our Customers Say
          </h2>
        </div>

        {/* Scroll-snap row */}
        <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-4 md:-mx-12 md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="w-[85%] shrink-0 snap-start border border-[#B08D57]/20 bg-[#FAF7F2] p-6 sm:w-[45%] lg:w-[calc(25%-15px)]"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    strokeWidth={1.5}
                    className={
                      i < t.rating
                        ? "fill-[#B08D57] text-[#B08D57]"
                        : "text-[#E8D8C5]"
                    }
                  />
                ))}
              </div>

              {/* Review */}
              <p className="font-sans text-[13px] leading-6 text-[#4A4A4A]">
                &ldquo;{t.review}&rdquo;
              </p>

              {/* Footer */}
              <div className="mt-6 flex items-center gap-3 border-t border-[#E8D8C5] pt-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B08D57]/15 font-sans text-[11px] font-semibold text-[#B08D57]">
                  {initials(t.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate font-sans text-xs font-medium text-[#2A1E17]">
                      {t.name}
                    </p>
                    <BadgeCheck
                      size={13}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#B08D57]"
                    />
                  </div>
                  <p className="font-sans text-[11px] text-[#4A4A4A]">
                    {t.location}
                    {t.product && (
                      <span className="text-[#4A4A4A]/70"> · {t.product}</span>
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}