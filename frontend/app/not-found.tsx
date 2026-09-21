import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-[#FAF7F2] px-6 py-20">
      {/* Decorative background rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="animate-[spin_60s_linear_infinite] h-[500px] w-[500px] rounded-full border border-[#B08D57]/10" />
        <div className="absolute animate-[spin_45s_linear_infinite_reverse] h-[380px] w-[380px] rounded-full border border-[#B08D57]/15" />
        <div className="absolute animate-[spin_30s_linear_infinite] h-[260px] w-[260px] rounded-full border border-[#B08D57]/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated pendant/charm motif */}
        <div className="mb-8 animate-[float_4s_ease-in-out_infinite]">
          <svg width="72" height="90" viewBox="0 0 72 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M36 4V20"
              stroke="#B08D57"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="36" cy="30" r="10" stroke="#B08D57" strokeWidth="1.5" />
            <path
              d="M22 46L36 82L50 46"
              stroke="#B08D57"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="36" cy="82" r="3" fill="#B08D57" />
          </svg>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="h-[1px] w-8 bg-[#B08D57]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
            Page Not Found
          </span>
          <span className="h-[1px] w-8 bg-[#B08D57]" />
        </div>

        <h1 className="font-[var(--font-playfair)] text-6xl text-[#2A1E17] sm:text-7xl md:text-8xl">
          404
        </h1>

        <p className="mt-4 max-w-sm font-sans text-sm leading-6 text-[#4A4A4A]">
          The page you&apos;re looking for seems to have wandered off — much
          like an earring at the back of a drawer.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#B08D57] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
          >
            Back to Home
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border border-[#2A1E17] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#2A1E17] hover:text-white"
          >
            <Search size={14} strokeWidth={1.5} />
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  );
}