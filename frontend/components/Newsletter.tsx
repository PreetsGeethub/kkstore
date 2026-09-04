"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { useToast } from "./Toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast({
        variant: "error",
        title: "Enter your email",
        description: "We need it to send you the good stuff.",
      });
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      showToast({
        variant: "error",
        title: "That email looks off",
        description: "Double-check and try again.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: wire up to real newsletter endpoint
      await new Promise((resolve) => setTimeout(resolve, 700));

      showToast({
        variant: "success",
        title: "You're on the list!",
        description: "Watch your inbox for 10% off your first order.",
      });
      setEmail("");
    } catch {
      showToast({
        variant: "error",
        title: "Something went wrong",
        description: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#2A1E17] px-6 py-20 md:px-12 lg:py-24">
      {/* Subtle decorative gold ring, top-right */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#B08D57]/10" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-[#B08D57]/10" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center border border-[#B08D57]/40 text-[#B08D57]">
          <Mail size={22} strokeWidth={1.5} />
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="h-[1px] w-8 bg-[#B08D57]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
            Stay in the Loop
          </span>
          <span className="h-[1px] w-8 bg-[#B08D57]" />
        </div>

        <h2 className="font-[var(--font-playfair)] text-3xl text-white sm:text-4xl">
          Get 10% Off Your First Order
        </h2>

        <p className="mt-3 max-w-md font-sans text-sm font-light text-white/70">
          New drops, exclusive offers, and early access — straight to your
          inbox. No spam, just the good stuff.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="w-full border border-white/20 bg-white/5 px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 outline-none transition-colors duration-300 focus:border-[#B08D57]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="flex shrink-0 items-center justify-center gap-2 bg-[#B08D57] px-6 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {submitting ? "Joining..." : "Subscribe"}
            {!submitting && <ArrowRight size={14} strokeWidth={1.5} />}
          </button>
        </form>

        <p className="mt-4 font-sans text-[11px] text-white/40">
          By subscribing, you agree to our{" "}
          <a href="/privacy-policy" className="underline underline-offset-2 hover:text-white/70">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}