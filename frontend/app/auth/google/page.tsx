"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function CompleteGoogleProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();

  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast({
        variant: "error",
        title: "Session expired",
        description: "Please try signing in with Google again.",
      });
      router.push("/login");
      return;
    }

    if (phone.length !== 10) {
      showToast({ variant: "error", title: "Enter a valid 10-digit phone number" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/google/complete-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Failed to complete profile");
      }

      showToast({ variant: "success", title: "Welcome to KK Store!" });
      // Full page navigation (not router.push) so AuthProvider re-checks
      // /auth/me fresh with the newly-set cookies from this response
      window.location.href = "/account";
    } catch (error) {
      showToast({
        variant: "error",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF7F2] px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 font-[var(--font-playfair)] text-3xl text-[#2A1E17]">
          One Last Step
        </h1>
        <p className="mb-8 font-sans text-sm text-[#4A4A4A]">
          We need your phone number to complete your account — we&apos;ll use
          it for order updates and delivery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">
              Phone Number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              placeholder="10-digit mobile number"
              className="w-full border border-[#E8D8C5] bg-white px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none transition-colors duration-200 focus:border-[#B08D57]"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <>
                Complete Sign Up
                <ArrowRight size={14} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3">
  <div className="h-px flex-1 bg-[#E8D8C5]" />
  <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#4A4A4A]">or</span>
  <div className="h-px flex-1 bg-[#E8D8C5]" />
</div>


  <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/auth/google`}
  className="flex h-12 w-full items-center justify-center gap-3 border border-[#E8D8C5] bg-white font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] transition-colors duration-300 hover:border-[#B08D57]"
>
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</a>
      </div>
    </main>
  );
}