"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, ShoppingBag, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "cart";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type VariantConfig = {
  icon: typeof CheckCircle2;
  iconColor: string;
};

const variantConfig: Record<ToastVariant, VariantConfig> = {
  success: { icon: CheckCircle2, iconColor: "text-[#7A9B76]" },
  error: { icon: XCircle, iconColor: "text-[#B5654F]" },
  info: { icon: Info, iconColor: "text-[#B08D57]" },
  cart: { icon: ShoppingBag, iconColor: "text-[#B08D57]" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);

      window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast viewport — fixed, stacks upward, mobile-safe bottom offset */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2.5 px-4 sm:bottom-8 sm:items-end sm:px-6">
        {toasts.map((toast) => {
          const { icon: Icon, iconColor } = variantConfig[toast.variant];

          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-[toastIn_0.35s_cubic-bezier(0.16,1,0.3,1)_both] items-start gap-3 border border-[#E8D8C5] bg-[#FAF7F2]/95 p-4 shadow-[0_12px_32px_rgba(42,30,23,0.14)] backdrop-blur-md"
            >
              <Icon size={18} strokeWidth={1.5} className={`mt-0.5 shrink-0 ${iconColor}`} />

              <div className="min-w-0 flex-1">
                <p className="font-sans text-[13px] font-medium text-[#2A1E17]">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 font-sans text-xs text-[#4A4A4A]">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-[#4A4A4A] transition-colors duration-200 hover:text-[#2A1E17]"
              >
                <X size={14} strokeWidth={1.5} />
              </button>

              {/* Bottom progress bar — depletes over the toast's lifetime */}
              <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left animate-[toastProgress_3.5s_linear_forwards] bg-[#B08D57]" />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}