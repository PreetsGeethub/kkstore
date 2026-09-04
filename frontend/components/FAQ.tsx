"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "Will my jewellery tarnish or fade over time?",
    answer:
      "No — every piece is made from premium anti-tarnish stainless steel, designed to keep its shine through daily wear, water, and sweat. No fading, no discoloration.",
  },
  {
    question: "Is it safe for sensitive skin?",
    answer:
      "Yes, our stainless steel pieces are skin-friendly and hypoallergenic, making them a great choice even if you react to regular fashion jewellery.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit/debit cards, net banking, and wallets. We currently don't offer Cash on Delivery.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "Not at the moment — all orders are placed through secure online payment only.",
  },
  {
    question: "What's your shipping time and cost?",
    answer:
      "We deliver across India. Shipping is free on orders above ₹499, with a small charge on orders below that. Delivery timelines are shown at checkout based on your pincode.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "We don't offer returns or exchanges. If you receive a damaged, defective, or incorrect item, we'll happily arrange a replacement after verification — just reach out within a few days of delivery.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "No — guest checkout is available. You can also create an account if you'd like to track orders and check out faster next time.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-[#FAF7F2] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              Good to Know
            </span>
            <span className="h-[1px] w-8 bg-[#B08D57]" />
          </div>
          <h2 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-[#E8D8C5] border-y border-[#E8D8C5]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="font-sans text-sm font-medium text-[#2A1E17] sm:text-base">
                    {faq.question}
                  </span>

                  <Plus
                    size={18}
                    strokeWidth={1.5}
                    className={`shrink-0 text-[#B08D57] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="pb-5 font-sans text-sm leading-6 text-[#4A4A4A]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}