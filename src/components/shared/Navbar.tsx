"use client";

import { ShoppingBag, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useBranchStore } from "@/store/useBranchStore";
import { useCartStore } from "@/store/useCartStore";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
    if (pathname.startsWith('/admin')) return null;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Global Stores
  const { currentBranch, toggleBranchSelector } = useBranchStore();
  const { toggleCart, items } = useCartStore();

  // 2. Hydration Fix & Scroll Listener
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent hydration mismatch on the badge/branch text
  if (!mounted) return null; 

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-karak-cream/80 backdrop-blur-md border-b border-karak-black/5 py-4 shadow-sm"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 group">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-karak-black group-hover:opacity-80 transition-opacity">
              Karak <span className="text-karak-orange">&</span> Go
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Menu", "Our Story", "Merch"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-karak-black/80 hover:text-karak-orange transition-colors"
              >
                {item}
              </Link>
            ))}

            {/* Location Badge */}
            <button
              onClick={() => toggleBranchSelector(true)}
              className="flex items-center gap-2 pl-4 border-l border-karak-black/10 text-sm font-medium text-karak-black hover:text-karak-orange transition-colors group"
              aria-label="Change Location"
            >
              <div className="bg-karak-orange/10 p-1.5 rounded-full group-hover:bg-karak-orange group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="max-w-[100px] truncate">
                {currentBranch ? currentBranch.name.split(" ")[0] : "Select Location"}
              </span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 z-50">
            {/* Cart Button */}
            <button 
              onClick={() => toggleCart(true)}
              className="relative p-2 text-karak-black hover:bg-karak-black/5 rounded-full transition-colors group"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-karak-orange transition-colors" />
              
              {/* Animated Notification Badge */}
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 w-2.5 h-2.5 bg-karak-orange rounded-full ring-2 ring-karak-cream"
                  />
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-karak-black hover:bg-karak-black/5 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-karak-cream pt-24 px-6 md:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-2xl font-serif text-karak-black">
              {["Menu", "Our Story", "Merch"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b border-karak-black/10 pb-4 active:text-karak-orange"
                >
                  {item}
                </Link>
              ))}
              
              {/* Mobile Location Selector */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleBranchSelector(true);
                }}
                className="flex items-center gap-3 text-lg font-sans font-medium text-karak-orange pt-4"
              >
                <MapPin className="w-6 h-6" />
                {currentBranch ? currentBranch.name : "Select Location"}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}