"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/components/Auth";

const navItems = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FAF7F2]">
        <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
      </main>
    );
  }

  return (
    <main className="bg-[#FAF7F2] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="mb-10 font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl">
          My Account
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <p className="mb-4 font-sans text-xs text-[#4A4A4A]">
              {user.firstName} {user.lastName}
            </p>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] transition-colors duration-200 ${
                      active
                        ? "bg-[#B08D57]/10 text-[#B08D57]"
                        : "text-[#4A4A4A] hover:bg-white"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex shrink-0 items-center gap-2.5 px-3 py-2.5 font-sans text-xs uppercase tracking-[0.1em] text-[#B5654F] transition-colors duration-200 hover:bg-white"
              >
                <LogOut size={15} strokeWidth={1.5} />
                Log Out
              </button>
            </nav>
          </aside>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}