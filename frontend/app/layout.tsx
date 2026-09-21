import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/Auth";
import { CartProvider } from "@/components/Cart";
import { WishlistProvider } from "@/components/Wishlist";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KK Store",
  description: "Luxury Within Reach",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
     <body className="min-h-full flex flex-col">
  <ToastProvider>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AnnouncementBar />
          <Navbar />
          {children}
          <Footer />
          <WhatsAppWidget />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
</body>
    </html>
  );
}