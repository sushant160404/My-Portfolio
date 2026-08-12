import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Dribbble, ArrowUp } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const social = settings.socialLinks || {};

  return (
    <footer className="py-12 bg-[#0A0A0A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Social Links Row */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {social.facebook && (
            <a
              href={social.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-neutral-400 text-xs font-bold transition-all"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>FACEBOOK</span>
            </a>
          )}

          {social.instagram && (
            <a
              href={social.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-neutral-400 text-xs font-bold transition-all"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM</span>
            </a>
          )}

          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-neutral-400 text-xs font-bold transition-all"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>TWITTER</span>
            </a>
          )}

          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-neutral-400 text-xs font-bold transition-all"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LINKEDIN</span>
            </a>
          )}

          {social.dribbble && (
            <a
              href={social.dribbble}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] text-neutral-400 text-xs font-bold transition-all"
            >
              <Dribbble className="w-3.5 h-3.5" />
              <span>DRIBBBLE</span>
            </a>
          )}
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-neutral-500 font-medium">
          <p>© 2026 Personal Portfolio. All Rights Reserved Designed By Fleextstudio</p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-[#CCFF00] transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
