import React, { useState, useEffect } from 'react';
import { Search, Shield, ArrowUpRight, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenSearch, onNavigateHome }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (onNavigateHome) {
      onNavigateHome();
    }
    setMobileMenuOpen(false);
    // Allow smooth scroll to section
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Blog', href: '#blog' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0E0E0E]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('#')}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-8 h-8 rounded-full border border-[#CCFF00] flex items-center justify-center p-1 group-hover:rotate-45 transition-transform duration-300">
            <div className="w-full h-full bg-[#CCFF00] rounded-full flex items-center justify-center">
              <span className="text-black font-black text-xs">S</span>
            </div>
          </div>
          <span className="text-2xl font-black tracking-widest text-white flex items-center">
            SIFT<span className="text-[#CCFF00]">.</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-xs uppercase tracking-widest text-neutral-400 hover:text-[#CCFF00] transition-colors font-semibold"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search Cmd+K */}
          <button
            onClick={onOpenSearch}
            id="search-palette-trigger"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium transition-colors"
            title="Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="hidden lg:inline text-neutral-400">Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
              ⌘K
            </kbd>
          </button>

          {/* Admin CMS Access */}
          <button
            onClick={onOpenAdmin}
            id="admin-panel-trigger"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold hover:bg-[#CCFF00]/20 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin CMS</span>
          </button>

          {/* Hire Me CTA */}
          <a
            href="#contact"
            id="header-hire-me-btn"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            <span>Hire Us</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-[#CCFF00]"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121212] border-b border-white/10 px-6 py-6 mt-3 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#CCFF00]"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-bold text-xs uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>Admin CMS Portal</span>
            </button>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider"
            >
              Hire Us Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
