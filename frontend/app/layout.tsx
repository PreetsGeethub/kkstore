import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import AnnouncementBar from "../components/AnnouncementBar";
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
  <AnnouncementBar />
  <Navbar />
  {children}
</body>
    </html>
  );
} 