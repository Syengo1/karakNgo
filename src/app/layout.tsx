import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Permanent_Marker } from "next/font/google";
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

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker", // We will use this variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crack & Go | Sip. Snap. Go.",
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
      <body className={`${playfair.variable} ${dmSans.variable} ${permanentMarker.variable} bg-crack-cream text-crack-black antialiased overflow-x-hidden selection:bg-crack-orange selection:text-white`}>
        
        <Navbar />
        <BranchSelector />
        <CartDrawer />
        {children}
      </body>
    </html>
  );
}