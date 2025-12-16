"use client";

import { ShoppingBag, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useBranchStore } from "@/store/useBranchStore";
import { useCartStore } from "@/store/useCartStore";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Menu", href: "/menu" },
  { name: "Our Story", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  // Global State
  const { currentBranch, toggleBranchSelector } = useBranchStore();
  const { toggleCart, items } = useCartStore();

  // Local State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      // Logic: Solid background triggers earlier on mobile (10px) than desktop (20px)
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* SMART HEADER:
        - h-20 / h-24: Fixed heights to prevent layout shifts
        - backdrop-blur: Keeps text readable over hero images
      */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ease-in-out ${
          isScrolled || isMobileMenuOpen
            ? "bg-crack-cream/95 backdrop-blur-xl border-b border-crack-black/5 py-3 shadow-sm"
            : "bg-transparent py-5 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="relative z-[70] group" onClick={() => setIsMobileMenuOpen(false)}>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-crack-black group-hover:opacity-80 transition-opacity">
              Crack <span className="text-crack-orange">&</span> Go
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative ${
                    isActive ? "text-crack-orange font-bold" : "text-crack-black/80 hover:text-crack-orange"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-crack-orange rounded-full" />
                  )}
                </Link>
              );
            })}

            <button
              onClick={() => toggleBranchSelector(true)}
              className={`flex items-center gap-2 pl-6 border-l text-sm font-medium transition-all group ${
                isScrolled ? "border-crack-black/10" : "border-crack-black/5"
              }`}
            >
              <div className="bg-crack-orange/10 p-1.5 rounded-full group-hover:bg-crack-orange group-hover:text-white transition-colors text-crack-orange">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[10px] uppercase tracking-wider opacity-50">Location</span>
                <span className="max-w-[120px] truncate text-crack-black group-hover:text-crack-orange transition-colors">
                  {currentBranch ? currentBranch.name.split(" ")[0] : "Select Branch"}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 z-[70]">
            <button 
              onClick={() => {
                toggleCart(true);
                setIsMobileMenuOpen(false);
              }}
              className="relative p-2.5 text-crack-black hover:bg-crack-black/5 rounded-full transition-colors group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-crack-orange transition-colors" />
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute top-1 right-1 w-2.5 h-2.5 bg-crack-orange rounded-full ring-2 ring-crack-cream"
                  />
                )}
              </AnimatePresence>
            </button>

            <button
              className="md:hidden p-2 text-crack-black hover:bg-crack-black/5 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[55] bg-crack-cream pt-32 px-6 md:hidden flex flex-col h-[100dvh]"
          >
            <nav className="flex flex-col gap-8 text-3xl font-serif text-crack-black">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`border-b border-crack-black/5 pb-4 transition-colors ${pathname === link.href ? "text-crack-orange pl-2" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleBranchSelector(true);
                }}
                className="flex items-center gap-4 text-xl font-sans font-medium text-crack-orange pt-4"
              >
                <div className="bg-crack-orange/20 p-3 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <span>{currentBranch ? currentBranch.name : "Select Location"}</span>
              </button>
            </nav>

            <div className="mt-auto pb-12 text-center opacity-30">
              <p className="font-marker text-xl">Crack & Go</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}