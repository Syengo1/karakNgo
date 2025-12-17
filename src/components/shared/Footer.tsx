"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Instagram, Twitter, Facebook, MapPin, Mail, 
  ArrowUpRight, ShieldCheck, Heart 
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // 1. Hide Footer on Admin Pages (Same logic as Navbar)
  if (pathname?.startsWith('/admin')) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-crack-black text-crack-cream pt-20 pb-10 rounded-t-[3rem] mt-20 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-crack-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- TOP SECTION: Main Navigation --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <h2 className="font-serif text-4xl md:text-5xl italic tracking-tight hover:text-crack-orange transition-colors duration-300">
                Crack <span className="text-crack-orange not-italic">&</span> Go
              </h2>
            </Link>
            <p className="text-crack-cream/60 font-sans text-lg max-w-md leading-relaxed">
              Elevating the culture of tea and conversation. Crafted for the soul, designed for the feed.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialLink href="#" icon={Instagram} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-7 space-y-6">
            <h3 className="font-marker text-xl text-crack-orange tracking-wide rotate-[-1deg]">Explore</h3>
            <ul className="space-y-4 font-sans text-crack-cream/80">
              <li><FooterLink href="/menu" label="Our Menu" /></li>
              <li><FooterLink href="/about" label="Our Story" /></li>
              <li><FooterLink href="/locations" label="Find a Branch" /></li>
              <li><FooterLink href="/merch" label="Merch Drop" badge="New" /></li>
            </ul>
          </div>

          {/* Contact / Info */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="font-marker text-xl text-crack-orange tracking-wide rotate-[1deg]">Say Hello</h3>
            <ul className="space-y-4 font-sans text-crack-cream/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-crack-orange shrink-0 mt-0.5" />
                <span>Nairobi, Kenya<br/><span className="text-xs opacity-50">Multiple Locations</span></span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-crack-orange shrink-0" />
                <a href="mailto:hello@crackandgo.com" className="hover:text-white transition-colors">hello@crackandgo.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Copyright & Admin --- */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-sans text-crack-cream/40">
          
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} Crack & Go. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> in Nairobi
            </span>
            
            {/* --- SECURE ADMIN LINK --- */}
            {/* Logic: Links to /admin/dashboard. 
                - If Auth cookie exists -> Middleware allows access.
                - If No cookie -> Middleware redirects to /admin/login.
                - This keeps the footer clean but functional for staff.
            */}
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-1.5 hover:text-crack-orange transition-colors group"
              title="Staff Access Only"
            >
              <ShieldCheck className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <span className="opacity-50 group-hover:opacity-100 font-medium">Staff Portal</span>
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}

// --- SUB-COMPONENTS ---

function SocialLink({ href, icon: Icon }: any) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-crack-cream/70 hover:bg-crack-orange hover:text-white hover:border-crack-orange transition-all duration-300"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function FooterLink({ href, label, badge }: any) {
  return (
    <Link href={href} className="group flex items-center gap-2 w-fit">
      <span className="relative">
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-px bg-crack-orange transition-all group-hover:w-full" />
      </span>
      {badge && (
        <span className="text-[9px] font-bold uppercase bg-crack-orange text-white px-1.5 py-0.5 rounded-sm">
          {badge}
        </span>
      )}
      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-crack-orange" />
    </Link>
  );
}