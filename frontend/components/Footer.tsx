import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import {
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";

const shopLinks = [
  { label: "Necklaces", href: "/products?category=necklaces" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Rings", href: "/products?category=rings" },
  { label: "Bracelets", href: "/products?category=bracelets" },
  { label: "Anklets", href: "/products?category=anklets" },
  { label: "Jewellery Sets", href: "/products?category=jewellery-sets" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "FAQs", href: "/#faq" },
];

const policyLinks = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Replacement Policy", href: "/replacement-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export default function Footer() {
  return (
    <footer className="bg-[#2A1E17] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-[var(--font-playfair)] text-2xl tracking-wide text-white transition-opacity duration-300 hover:opacity-80"
            >
              KK STORE
            </Link>

            <p className="mt-4 max-w-xs font-sans text-sm font-light leading-6 text-white/60">
              Anti-tarnish, skin-friendly jewellery for everyday wear,
              modern, elegant, and made for real life.
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/kkstore"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors duration-300 hover:border-[#B08D57] hover:text-[#B08D57]"
              >
                <FaInstagram size={15} />
              </a>

              <a
                href="https://facebook.com/kkstore"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors duration-300 hover:border-[#B08D57] hover:text-[#B08D57]"
              >
                <FaFacebookF size={14} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              Shop
            </h4>

            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/70 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              Company
            </h4>

            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/70 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              Get in Touch
            </h4>

            <ul className="space-y-4">
              {/* WhatsApp */}
              <li className="flex items-start gap-3">
                <FiPhone
                  size={15}
                  className="mt-0.5 shrink-0 text-[#B08D57]"
                />

                <a
                  href="https://wa.me/910000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  WhatsApp Support
                </a>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <FiMail
                  size={15}
                  className="mt-0.5 shrink-0 text-[#B08D57]"
                />

                <a
                  href="mailto:hello@kkstore.in"
                  className="font-sans text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  hello@kkstore.in
                </a>
              </li>

              {/* Shipping */}
              <li className="flex items-start gap-3">
                <FiMapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-[#B08D57]"
                />

                <span className="font-sans text-sm text-white/70">
                  Shipping across India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {policyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-sans text-xs text-white/50 transition-colors duration-300 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="font-sans text-xs text-white/40">
            {new Date().getFullYear()} KK Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}