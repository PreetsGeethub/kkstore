"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collections" },
  {
    href: "/products?sort=newest",
    label: "New Arrivals",
  },
];

const collections = [
  {
    name: "Necklaces",
    href: "/products?category=necklaces",
    image: "/collections/necklaces.jpg",
  },
  {
    name: "Bracelets",
    href: "/products?category=bracelets",
    image: "/collections/bracelets.jpg",
  },
  {
    name: "Earrings",
    href: "/products?category=earrings",
    image: "/collections/earrings.jpg",
  },
  {
    name: "Rings",
    href: "/products?category=rings",
    image: "/collections/rings.jpg",
  },
];

const iconButton =
  "relative flex h-10 w-10 items-center justify-center " +
  "border border-[#E8D8C5] text-[#2A1E17] " +
  "transition-all duration-300 " +
  "hover:border-[#B08D57] hover:-translate-y-[1px] " +
  "focus-visible:outline-none focus-visible:ring-1 " +
  "focus-visible:ring-[#B08D57]";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Temporary values until real store state is connected.
  const wishlistCount = 0;
  const cartCount = 0;

  // FIX #1: distinguish "New Arrivals" (/products?sort=newest) from
  // "Collections" (/products and everything else under it) since
  // pathname alone can't tell them apart.
  const isNewArrivals =
    pathname === "/products" && searchParams.get("sort") === "newest";
  const isCollectionsActive =
    pathname.startsWith("/products") && !isNewArrivals;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock page scroll when mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menus with Escape.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCollectionsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // FIX #2: close both the mobile menu AND the mega menu on route change.
  // Previously only menuOpen reset, so the mega menu could stay stuck
  // open after clicking a category link.
  useEffect(() => {
    setMenuOpen(false);
    setCollectionsOpen(false);
  }, [pathname, searchParams]);

  const isActive = (href: string) => {
    const basePath = href.split("?")[0];

    if (basePath === "/") {
      return pathname === "/";
    }

    if (href.includes("sort=newest")) {
      return isNewArrivals;
    }

    return pathname.startsWith(basePath) && !isNewArrivals;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-16 transition-all duration-300 md:h-20 ${
          scrolled
            ? "bg-[#FAF7F2]/95 shadow-[0_1px_0_0_#E8D8C5] backdrop-blur-md"
            : "bg-[#FAF7F2]"
        }`}
      >
        <nav className="mx-auto grid h-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-[var(--font-playfair)] text-xl tracking-wide text-[#2A1E17] transition-opacity duration-300 hover:opacity-75 sm:text-2xl md:text-[26px]"
          >
            KK STORE
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center justify-center gap-10 lg:flex">
            {/* Home */}
            <Link
              href="/"
              className="group relative py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A1E17]"
            >
              Home
              <span
                className={`absolute bottom-0 left-0 h-px bg-[#B08D57] transition-all duration-300 ${
                  isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            {/* Collections */}
            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              {/*
                FIX #3: click now always OPENS (never toggles closed),
                so it can't fight with onMouseEnter. Closing happens via
                onMouseLeave, Escape, or route change instead — no more
                flicker when a hovering mouse user clicks the trigger.
              */}
              <button
                type="button"
                aria-expanded={collectionsOpen}
                onClick={() => setCollectionsOpen(true)}
                className="group relative flex items-center gap-1 py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A1E17]"
              >
                Collections
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${
                    collectionsOpen ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px bg-[#B08D57] transition-all duration-300 ${
                    isCollectionsActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>

              {/* Mega menu */}
              <div
                className={`fixed left-0 top-16 hidden w-full transition-all duration-300 md:top-20 lg:block ${
                  collectionsOpen
                    ? "pointer-events-auto visible opacity-100"
                    : "pointer-events-none invisible opacity-0"
                }`}
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <div className="border-t border-[#E8D8C5] bg-white shadow-[0_15px_40px_rgba(42,30,23,0.08)]">
                  <div className="mx-auto grid max-w-7xl grid-cols-[1fr_320px] gap-12 p-12">
                    {/* Categories */}
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <p className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#B08D57]">
                          Explore Collections
                        </p>

                        {/* Added: "View All" link, per brief's mega menu spec */}
                        <Link
                          href="/products"
                          className="group flex items-center gap-1 font-sans text-[10px] uppercase tracking-[0.25em] text-[#2A1E17]"
                        >
                          View All
                          <ArrowUpRight
                            size={13}
                            strokeWidth={1.5}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </Link>
                      </div>

                      <div className="grid grid-cols-4 gap-6">
                        {collections.map((collection) => (
                          <Link
                            key={collection.name}
                            href={collection.href}
                            className="group"
                          >
                            <div className="aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
                              <img
                                src={collection.image}
                                alt={collection.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="font-[var(--font-playfair)] text-base text-[#2A1E17]">
                                {collection.name}
                              </span>
                              <ArrowUpRight
                                size={15}
                                strokeWidth={1.5}
                                className="text-[#B08D57] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="border-l border-[#E8D8C5] pl-10">
                      <p className="mb-6 font-sans text-[10px] uppercase tracking-[0.35em] text-[#B08D57]">
                        Featured
                      </p>

                      <Link href="/products" className="group block">
                        <div className="aspect-[4/5] overflow-hidden bg-[#FAF7F2]">
                          <img
                            src="/products/featured.jpg"
                            alt="Featured KK Store product"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                              Signature Collection
                            </p>
                            <p className="mt-1 font-sans text-xs text-[#4A4A4A]">
                              Discover our latest pieces
                            </p>
                          </div>
                          <ArrowUpRight
                            size={18}
                            strokeWidth={1.5}
                            className="text-[#B08D57]"
                          />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New arrivals */}
            <Link
              href="/products?sort=newest"
              className="group relative py-2 font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A1E17]"
            >
              New Arrivals
              <span
                className={`absolute bottom-0 left-0 h-px bg-[#B08D57] transition-all duration-300 ${
                  isNewArrivals ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </div>

          {/* Desktop + mobile actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className={`hidden ${iconButton} sm:flex`}
            >
              <Search size={16} strokeWidth={1.5} />
            </button>

            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              className={`hidden ${iconButton} sm:flex`}
            >
              <Heart size={16} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B08D57] font-sans text-[9px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              aria-label="Account"
              className={`hidden ${iconButton} sm:flex`}
            >
              <User size={16} strokeWidth={1.5} />
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className={`${iconButton}`}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B08D57] font-sans text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center text-[#2A1E17] lg:hidden"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-[#2A1E17]/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-50 h-full w-[82%] max-w-sm transform bg-[#FAF7F2] shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#E8D8C5] px-6 md:h-20">
          <span className="font-[var(--font-playfair)] text-lg text-[#2A1E17]">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center text-[#2A1E17]"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-8">
          {navLinks.map((link, index) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  transitionDelay: menuOpen ? `${index * 60}ms` : "0ms",
                }}
                className={`block border-b border-[#E8D8C5] py-4 font-sans text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                  active ? "text-[#B08D57]" : "text-[#2A1E17]"
                } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-8 space-y-5">
            <Link
              href="/account"
              className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.25em] text-[#2A1E17]"
            >
              <User size={16} strokeWidth={1.5} />
              Account
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.25em] text-[#2A1E17]"
            >
              <Heart size={16} strokeWidth={1.5} />
              Wishlist
            </Link>

            <button
              type="button"
              className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.25em] text-[#2A1E17]"
            >
              <Search size={16} strokeWidth={1.5} />
              Search
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}