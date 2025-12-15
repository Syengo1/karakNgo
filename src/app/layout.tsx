import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import BranchSelector from "@/components/shared/BranchSelector";
import CartDrawer from "@/components/cart/CartDrawer";

// 1. Configure the Premium Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Karak & Go | Sip. Snap. Go.",
  description: "The premium beverage experience in Nairobi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 2. Apply fonts and the 'Oatmeal' background color globally */}
      <body className={`${playfair.variable} ${dmSans.variable} bg-karak-cream text-karak-black antialiased overflow-x-hidden selection:bg-karak-orange selection:text-white`}>
        
        <Navbar />
        <BranchSelector />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}