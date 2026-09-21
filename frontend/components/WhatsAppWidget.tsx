"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "910000000000"; // TODO: replace with your real business number (country code + number, no + or spaces)
const DEFAULT_MESSAGE = "Hi! I have a question about KK Store products.";

export default function WhatsAppWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_16px_rgba(37,211,102,0.4)] transition-transform duration-300 hover:scale-110 sm:bottom-8 sm:right-8"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" />
      <MessageCircle size={26} strokeWidth={1.5} className="relative z-10 fill-white text-white" />

      {/* Tooltip on hover, desktop only */}
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap bg-[#2A1E17] px-3 py-2 font-sans text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
        Chat with us
        <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#2A1E17]" />
      </span>
    </a>
  );
}