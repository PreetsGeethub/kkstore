"use client";

import { useEffect, useState } from "react";
import { Bot, X, Send } from "lucide-react";
import { sendAIMessage, type AIProduct } from "@/lib/aiApi";
export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<
  { role: "user" | "assistant"; content: string }[]
>([]);

const [conversationId, setConversationId] = useState<string | undefined>(
  undefined
);

const [isLoading, setIsLoading] = useState(false);

const [error, setError] = useState<string | null>(null);

const [products, setProducts] = useState<AIProduct[]>([]);

  useEffect(() => {
    if (
      window.sessionStorage.getItem("kk-ai-intro-seen") === "true" ||
      window.sessionStorage.getItem("kk-ai-welcome-dismissed") === "true"
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsIntroActive(true);
    }, 850);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isIntroActive) return;

    const timeoutId = window.setTimeout(() => {
      window.sessionStorage.setItem("kk-ai-intro-seen", "true");
      setIsIntroActive(false);
      setIsWelcomeVisible(true);
    }, 4600);

    return () => window.clearTimeout(timeoutId);
  }, [isIntroActive]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openAssistant = () => {
    window.sessionStorage.setItem("kk-ai-intro-seen", "true");
    window.sessionStorage.setItem("kk-ai-welcome-dismissed", "true");
    setIsIntroActive(false);
    setIsWelcomeVisible(false);
    setIsOpen(true);
  };

  const skipIntro = () => {
    window.sessionStorage.setItem("kk-ai-intro-seen", "true");
    setIsIntroActive(false);
    setIsWelcomeVisible(true);
  };

  const closeIntro = () => {
    window.sessionStorage.setItem("kk-ai-intro-seen", "true");
    window.sessionStorage.setItem("kk-ai-welcome-dismissed", "true");
    setIsIntroActive(false);
    setIsWelcomeVisible(false);
  };

  const dismissWelcome = () => {
    window.sessionStorage.setItem("kk-ai-welcome-dismissed", "true");
    setIsWelcomeVisible(false);
  };

  return (
    <>
      {/* First-visit center-stage robot greeting */}
      {isIntroActive && !isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Meet KK, your shopping assistant"
          className="kk-intro-backdrop fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-5 py-8"
        >
          <div aria-hidden="true" className="kk-intro-orb kk-intro-orb-one" />
          <div aria-hidden="true" className="kk-intro-orb kk-intro-orb-two" />
          <button
            type="button"
            onClick={closeIntro}
            aria-label="Close KK introduction"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8D8C5] bg-[#FAF7F2]/90 text-[#2A1E17] shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57] sm:right-8 sm:top-8"
          >
            <X size={19} />
          </button>

          <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
            <div className="kk-robot-arrival relative flex h-48 w-48 items-center justify-center sm:h-60 sm:w-60">
              <div aria-hidden="true" className="kk-robot-halo absolute inset-3 rounded-full" />
              <svg
                aria-hidden="true"
                viewBox="0 0 220 230"
                className="kk-robot-model relative z-10 h-full w-full overflow-visible drop-shadow-[0_22px_18px_rgba(42,30,23,0.2)]"
                fill="none"
              >
                <defs>
                  <linearGradient id="kk-shell" x1="38" y1="25" x2="174" y2="180" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset=".48" stopColor="#E9E5DF" />
                    <stop offset="1" stopColor="#B9B2A9" />
                  </linearGradient>
                  <linearGradient id="kk-gold" x1="63" y1="0" x2="155" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E7C98C" />
                    <stop offset=".55" stopColor="#B08D57" />
                    <stop offset="1" stopColor="#78562F" />
                  </linearGradient>
                  <linearGradient id="kk-face" x1="61" y1="54" x2="160" y2="125" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3D3028" />
                    <stop offset="1" stopColor="#17110E" />
                  </linearGradient>
                </defs>
                <ellipse cx="110" cy="211" rx="54" ry="10" fill="#2A1E17" opacity=".12" />
                <path d="M110 18V34" stroke="url(#kk-gold)" strokeWidth="7" strokeLinecap="round" />
                <circle cx="110" cy="13" r="9" fill="url(#kk-gold)" />
                <path d="M70 151C54 155 47 170 48 186L52 198C54 205 63 207 68 201L82 179" fill="url(#kk-shell)" stroke="#B9B2A9" strokeWidth="2" />
                <g className="kk-robot-wave">
                  <path d="M149 151C166 150 178 160 181 175L184 187C185 195 176 201 170 195L155 179" fill="url(#kk-shell)" stroke="#B9B2A9" strokeWidth="2" />
                  <circle cx="184" cy="186" r="9" fill="url(#kk-gold)" />
                </g>
                <rect x="57" y="33" width="106" height="105" rx="34" fill="url(#kk-shell)" stroke="#C9C1B7" strokeWidth="2" />
                <rect x="65" y="48" width="90" height="72" rx="25" fill="url(#kk-face)" />
                <path d="M78 59C91 51 127 51 142 60" stroke="#FFFFFF" strokeOpacity=".18" strokeWidth="3" strokeLinecap="round" />
                <ellipse cx="88" cy="81" rx="8" ry="11" fill="#8DDCEB" />
                <ellipse cx="132" cy="81" rx="8" ry="11" fill="#8DDCEB" />
                <circle cx="90" cy="78" r="2.5" fill="#FFFFFF" />
                <circle cx="134" cy="78" r="2.5" fill="#FFFFFF" />
                <path d="M96 100C103 108 117 108 124 100" stroke="#E7C98C" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="53" cy="81" r="8" fill="url(#kk-gold)" />
                <circle cx="167" cy="81" r="8" fill="url(#kk-gold)" />
                <rect x="77" y="139" width="66" height="14" rx="7" fill="url(#kk-gold)" />
                <rect x="65" y="151" width="90" height="49" rx="20" fill="url(#kk-shell)" stroke="#C9C1B7" strokeWidth="2" />
                <path d="M84 164H136" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity=".8" />
                <rect x="93" y="173" width="34" height="14" rx="7" fill="#2A1E17" />
                <text x="110" y="183" fill="#E7C98C" fontSize="8" fontWeight="700" textAnchor="middle" letterSpacing="1.5">KK</text>
                <path d="M82 198L78 207C77 211 80 214 84 214H101V200" fill="url(#kk-shell)" stroke="#B9B2A9" strokeWidth="2" />
                <path d="M138 198L142 207C143 211 140 214 136 214H119V200" fill="url(#kk-shell)" stroke="#B9B2A9" strokeWidth="2" />
              </svg>
            </div>

            <div className="kk-intro-copy mt-1 w-full max-w-md border border-[#E8D8C5] bg-[#FAF7F2]/95 px-6 py-5 shadow-[0_16px_45px_rgba(42,30,23,0.12)] backdrop-blur-sm sm:px-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#9A7545]">Your personal shopping buddy</p>
              <h2 className="mt-2 font-[var(--font-playfair)] text-2xl text-[#2A1E17] sm:text-3xl">Hey there, I’m KK! <span aria-hidden="true">✨</span></h2>
              <p className="mt-2 font-sans text-sm leading-6 text-[#4A4A4A] sm:text-base">How can I help you today? Let’s find something special.</p>
              <button
                type="button"
                onClick={openAssistant}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-[#2A1E17] px-5 py-3 font-sans text-xs uppercase tracking-[0.18em] text-[#FAF7F2] transition hover:bg-[#8A693E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57] focus-visible:ring-offset-2"
              >
                Let’s shop <Send size={14} />
              </button>
              <button
                type="button"
                onClick={skipIntro}
                className="ml-3 inline-flex min-h-11 items-center justify-center px-3 py-3 font-sans text-xs text-[#6F6258] underline decoration-[#C9A96E] underline-offset-4 transition hover:text-[#2A1E17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]"
              >
                Skip intro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friendly KK robot launcher — opposite WhatsApp */}
      {!isOpen && isWelcomeVisible && (
        <div className="fixed bottom-24 left-5 z-40 w-[min(19rem,calc(100vw-2.5rem))] animate-in fade-in slide-in-from-bottom-2 duration-300 sm:bottom-28 sm:left-8">
          <div className="relative border border-[#E8D8C5] bg-[#FAF7F2] p-4 pr-10 shadow-[0_12px_35px_rgba(42,30,23,0.16)]">
            <button
              type="button"
              onClick={dismissWelcome}
              aria-label="Dismiss KK welcome message"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-[#9A8F86] transition-colors hover:text-[#2A1E17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]"
            >
              <X size={15} />
            </button>
            <button
              type="button"
              onClick={openAssistant}
              className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]"
            >
              <span className="mb-1 block font-[var(--font-playfair)] text-base text-[#2A1E17]">
                Hey, I’m KK! <span aria-hidden="true">🤖</span>
              </span>
              <span className="block font-sans text-sm leading-5 text-[#4A4A4A]">
                How can I help you today? I can help you find something special.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.18em] text-[#8A693E]">
                Chat with me <span aria-hidden="true">→</span>
              </span>
            </button>
            <span aria-hidden="true" className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 border-b border-r border-[#E8D8C5] bg-[#FAF7F2]" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openAssistant}
        aria-label="Open KK, your shopping assistant"
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : 0}
        className={`fixed bottom-6 left-5 z-40 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-[#B08D57] bg-[#2A1E17] text-[#FAF7F2] shadow-[0_8px_30px_rgba(42,30,23,0.24)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#3A2A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57] sm:bottom-8 sm:left-8 ${
          isOpen
            ? "pointer-events-none scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <Bot size={27} strokeWidth={1.6} />
        <span className="mt-0.5 font-sans text-[9px] font-semibold tracking-[0.2em]">KK</span>
        <span aria-hidden="true" className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-[#FAF7F2] bg-[#8CBA8F]" />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-[#2A1E17]/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Assistant panel */}
      <aside
        aria-label="KK Store AI Assistant"
        aria-hidden={!isOpen}
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-r border-[#E8D8C5] bg-[#FAF7F2] shadow-[15px_0_40px_rgba(42,30,23,0.10)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#E8D8C5] px-6">
          <div>
            <p className="font-[var(--font-playfair)] text-xl text-[#2A1E17]">
              KK AI
            </p>

            <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.25em] text-[#B08D57]">
              Personal Shopping Assistant
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close AI Assistant"
            className="flex h-10 w-10 items-center justify-center border border-[#E8D8C5] text-[#2A1E17] transition-colors duration-300 hover:border-[#B08D57] hover:text-[#B08D57] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B08D57]"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
  {messages.length === 0 ? (
    <>
      <div className="max-w-[90%] border border-[#E8D8C5] bg-white px-5 py-4">
        <p className="font-[var(--font-playfair)] text-base text-[#2A1E17]">
          Welcome to KK Store.
        </p>

        <p className="mt-2 font-sans text-sm leading-6 text-[#4A4A4A]">
          I can help you discover products, compare pieces, and find
          something that fits what you are looking for.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#B08D57]">
          Try asking
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Find me a ring under ₹5000",
            "Show me something cheaper",
            "Tell me more about that product",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="border border-[#E8D8C5] px-3 py-2 text-left font-sans text-xs text-[#2A1E17] transition-colors duration-300 hover:border-[#B08D57] hover:text-[#B08D57]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </>
  ) : (
    <div className="space-y-5">
      {messages.map((item, index) => (
        <div
          key={`${item.role}-${index}`}
          className={`flex ${
            item.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] px-4 py-3 ${
              item.role === "user"
                ? "bg-[#2A1E17] text-[#FAF7F2]"
                : "border border-[#E8D8C5] bg-white text-[#4A4A4A]"
            }`}
          >
            <p className="whitespace-pre-wrap font-sans text-sm leading-6">
              {item.content}
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="border border-[#E8D8C5] bg-white px-4 py-3">
          <p className="font-sans text-sm text-[#9A8F86]">
            Finding something for you...
          </p>
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-white px-4 py-3">
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden border border-[#E8D8C5] bg-white"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-40 w-full object-cover"
                />
              )}

              <div className="p-4">
                <p className="font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                  {product.name}
                </p>

                <p className="mt-1 font-sans text-sm text-[#4A4A4A]">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 font-sans text-xs text-[#9A8F86]">
                  {product.stock} available
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

        {/* Input */}
        <div className="shrink-0 border-t border-[#E8D8C5] bg-[#FAF7F2] p-5">
          <form
           onSubmit={async (event) => {
            event.preventDefault();
          
            const trimmedMessage = message.trim();
          
            if (!trimmedMessage || isLoading) return;
          
            setError(null);
          
            setMessages((current) => [
              ...current,
              {
                role: "user",
                content: trimmedMessage,
              },
            ]);
          
            setMessage("");
            setIsLoading(true);
          
            try {
              const response = await sendAIMessage(
                trimmedMessage,
                conversationId
              );
          
              setConversationId(response.conversation_id);
          
              setMessages((current) => [
                ...current,
                {
                  role: "assistant",
                  content: response.message,
                },
              ]);
          
              setProducts(response.products);
            } catch (err) {
              console.error("AI Assistant error:", err);
          
              setError(
                "Sorry, I couldn't connect to the shopping assistant. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          }}
            className="flex items-center gap-3 border border-[#E8D8C5] bg-white px-4 py-3 transition-colors duration-300 focus-within:border-[#B08D57]"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about our collections..."
              aria-label="Message KK AI"
              className="min-w-0 flex-1 bg-transparent font-sans text-sm text-[#2A1E17] outline-none placeholder:text-[#9A8F86]"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#2A1E17] text-[#FAF7F2] transition-all duration-300 hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send size={15} strokeWidth={1.5} />
            </button>
          </form>

          <p className="mt-3 text-center font-sans text-[9px] tracking-wide text-[#9A8F86]">
            Powered by KK AI
          </p>
        </div>
      </aside>
    </>
  );
}