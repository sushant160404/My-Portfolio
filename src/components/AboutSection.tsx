import React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const highlights = [
    'UI/UX DESIGN',
    'WEB DEVELOPMENT',
    'PRODUCT DESIGN',
    'BRANDING & DESIGN',
  ];

  return (
    <section id="about" className="py-24 bg-[#121212] text-white relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ABOUT ME</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              BEST JUNIOR SOFTWARE ENGINEER <br />
              <span className="font-serif italic text-neutral-300 font-light">& DEVELOPER</span> IN USA
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              {settings.aboutText}
            </p>

            {/* Checkmark Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a
                href="#contact"
                id="get-in-touch-about-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(204,255,0,0.25)]"
              >
                <span>GET IN TOUCH NOW</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Side Stats Matrix */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:border-[#CCFF00]/40 transition-colors">
              <span className="text-4xl font-black text-white">12K</span>
              <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mt-1">All Project Completed</span>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:border-[#CCFF00]/40 transition-colors">
              <span className="text-4xl font-black text-white">10K</span>
              <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mt-1">Satisfied Customer</span>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:border-[#CCFF00]/40 transition-colors">
              <span className="text-4xl font-black text-white">10K</span>
              <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mt-1">Satisfied Customer</span>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:border-[#CCFF00]/40 transition-colors">
              <span className="text-4xl font-black text-[#CCFF00]">12K</span>
              <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider mt-1">All Project Completed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
