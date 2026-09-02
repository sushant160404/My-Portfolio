import React from 'react';
import { Download, CheckCircle2, ArrowDownRight, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { addCacheBuster } from '../lib/uploadHelper';

interface HeroProps {
  settings: SiteSettings;
  onOpenVideo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onOpenVideo }) => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 bg-[#0E0E0E] text-white overflow-hidden flex items-center">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Floating Skill Badges + Developer Profile Image */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            
            {/* Left Floating Skills Bar */}
            <div className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20 bg-[#161616]/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-2xl">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 rotate-180 [writing-mode:vertical-lr] text-center mb-1">
                Best Skills On:
              </span>
              
              {/* Next.js */}
              <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 hover:border-[#CCFF00] transition-colors" title="Next.js">
                <svg className="w-5 h-5" viewBox="0 0 180 180" fill="none">
                  <mask id="mask0" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                    <circle cx="90" cy="90" r="90" fill="black"/>
                  </mask>
                  <g mask="url(#mask0)">
                    <circle cx="90" cy="90" r="90" fill="black"/>
                    <path d="M149.508 157.52L69.142 54H54V125.97H66.1731V69.3836L139.978 164.84C143.247 162.485 146.392 159.948 149.508 157.52Z" fill="url(#gradient0)"/>
                    <rect x="115" y="54" width="12" height="72" fill="url(#gradient1)"/>
                  </g>
                  <defs>
                    <linearGradient id="gradient0" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white"/>
                      <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="gradient1" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white"/>
                      <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Express.js */}
              <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-2 hover:border-[#CCFF00] transition-colors" title="Express.js">
                <span className="font-bold text-neutral-300 text-[9px] leading-none text-center">EXP</span>
              </div>

              {/* Node.js */}
              <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 hover:border-[#CCFF00] transition-colors" title="Node.js">
                <svg className="w-5 h-5" viewBox="0 0 256 289" fill="none">
                  <path d="M128 0L256 74v141L128 289 0 215V74L128 0z" fill="#539E43"/>
                  <path d="M128 20.5L19.5 81.5v126L128 268.5l108.5-61V81.5L128 20.5z" fill="#539E43"/>
                  <path d="M128 144.5c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z" fill="white"/>
                  <path d="M107 94h21v40h-21zM128 134h21v61h-21z" fill="white"/>
                </svg>
              </div>

              {/* React Native */}
              <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 hover:border-[#CCFF00] transition-colors" title="React Native">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="2.5" fill="#61DAFB"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(60 12 12)"/>
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(120 12 12)"/>
                </svg>
              </div>
            </div>

            {/* Profile Image Frame with Arch & Glowing Accent */}
            <div className="relative w-64 sm:w-80 lg:w-96 h-[380px] sm:h-[460px] rounded-t-full border-2 border-white/10 bg-[#161616] overflow-hidden flex items-end justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              {/* Background Arch Line */}
              <div className="absolute inset-2 rounded-t-full border border-[#CCFF00]/20 pointer-events-none" />
              
              <img
                src={addCacheBuster(settings.profileImageUrl || "/profile.jpg")}
                alt={settings.name}
                className="w-full h-full object-cover object-top filter hover:grayscale-0 transition-all duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/400x500/141414/CCFF00?text=Profile';
                }}
                loading="eager"
              />

              {/* Top Rotating Hire Us Badge */}
              <div className="absolute top-4 right-4 z-30">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-[#CCFF00] bg-black/60 backdrop-blur-sm animate-spin-slow" />
                  <a href="#contact" className="w-10 h-10 rounded-full bg-[#CCFF00] flex items-center justify-center text-black hover:scale-110 transition-transform">
                    <ArrowDownRight className="w-5 h-5 font-bold" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Hand Wave Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
              <span className="animate-bounce">👋</span>
              <span>Hi I'm {settings.name}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
                {settings.title.split('&')[0]}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-4xl sm:text-6xl lg:text-7xl font-serif italic text-neutral-300 font-light">&</span>
                <span className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#CCFF00] uppercase leading-[1.05]">
                  {settings.title.split('&')[1] || 'DEVELOPER'}
                </span>
              </div>
            </div>

            {/* Narrative Subtitle */}
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              {settings.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={settings.cvUrl || "/profile.jpg"}
                download={settings.cvFileName || "Alex_Robert_Resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                id="download-cv-hero-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-black text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_25px_rgba(204,255,0,0.4)]"
                style={{ backgroundColor: settings.theme?.accentColor || '#CCFF00' }}
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD CV</span>
              </a>
            </div>

            {/* Decorative Sift Star Geometric Icon */}
            <div className="hidden sm:block absolute right-4 bottom-8 text-[#CCFF00] opacity-40 pointer-events-none">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z" />
              </svg>
            </div>

          </div>
        </div>

        {/* Dynamic Stats Grid Below Hero */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center hover:border-[#CCFF00]/30 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-black text-white">{settings.stats.projectsCompleted}</h3>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">All Project Completed</p>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center hover:border-[#CCFF00]/30 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-black text-white">{settings.stats.satisfiedCustomers}</h3>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Satisfied Customer</p>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center hover:border-[#CCFF00]/30 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-black text-white">{settings.stats.yearsExperience}</h3>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Years Experience</p>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 text-center hover:border-[#CCFF00]/30 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-black text-[#CCFF00]">{settings.stats.clientRating}</h3>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">Client Review Rating</p>
          </div>
        </div>

      </div>
    </section>
  );
};
