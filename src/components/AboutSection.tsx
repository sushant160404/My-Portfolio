import React, { useState, useEffect, useCallback } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { SiteSettings, AboutCarouselCard } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

const DEFAULT_CARDS: AboutCarouselCard[] = [
  { id: 'ac1', tag: '1 • PROJECTS', label: 'LIVE SESSION', title: 'End-to-end products, built with precision.', accent: 'from-[#0f1a0f] to-neutral-900' },
  { id: 'ac2', tag: '2 • UI/UX DESIGN', label: 'FEATURED', title: 'Interfaces that feel intuitive, look stunning.', accent: 'from-[#0a0f1a] to-neutral-900' },
  { id: 'ac3', tag: '3 • WEB DEVELOPMENT', label: 'IN PROGRESS', title: 'Fast, scalable, and production-ready web apps.', accent: 'from-[#1a0f0a] to-neutral-900' },
  { id: 'ac4', tag: '4 • BRANDING', label: 'COMPLETED', title: 'Identity systems that leave a lasting impression.', accent: 'from-neutral-900 to-[#111]' },
  { id: 'ac5', tag: '5 • CONSULTING', label: 'AVAILABLE', title: 'Strategy and direction for your digital growth.', accent: 'from-[#0f0f1a] to-neutral-900' },
];

const FeatureCarousel: React.FC<{ cards: AboutCarouselCard[] }> = ({ cards }) => {
  const [active, setActive] = useState(0);
  const total = cards.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);

  useEffect(() => { setActive(0); }, [cards]);

  useEffect(() => {
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next]);

  const getPos = (i: number) => {
    let diff = i - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  if (!cards.length) return null;

  return (
    <div className="lg:col-span-5 relative flex items-center justify-center h-[420px] overflow-hidden">
      {cards.map((card, i) => {
        const pos = getPos(i);
        const isActive = pos === 0;
        if (Math.abs(pos) > 1) return null;

        return (
          <div
            key={card.id}
            onClick={() => setActive(i)}
            style={{
              transform: `translateX(${pos * 72}%) scale(${isActive ? 1 : 0.82})`,
              opacity: isActive ? 1 : 0.45,
              zIndex: isActive ? 10 : 5,
              filter: isActive ? 'none' : 'blur(2px)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className={`absolute w-[240px] h-[380px] rounded-3xl cursor-pointer bg-gradient-to-b ${card.accent} border ${isActive ? 'border-white/10' : 'border-white/5'} flex flex-col justify-between p-6 select-none`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{card.label}</span>
            </div>

            {/* Card image or placeholder */}
            <div className="flex-1 rounded-xl overflow-hidden border border-white/5 mx-0">
              {card.image
                ? <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-white/[0.03]" />
              }
            </div>

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70">
                {card.tag}
              </span>
              <p className="text-white text-lg font-bold leading-snug">{card.title}</p>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-0 flex gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'bg-[#CCFF00] w-4' : 'bg-white/20 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const cards = (settings.aboutCarousel && settings.aboutCarousel.length > 0)
    ? settings.aboutCarousel
    : DEFAULT_CARDS;

  const highlights = [
    'SOFTWARE DEVELOPMENT',
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
              <span className="font-serif italic text-neutral-300 font-light">& DEVELOPER</span> IN INDIA
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              {settings.aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-200">{item}</span>
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

          {/* Right Side — Feature Carousel */}
          <FeatureCarousel cards={cards} />

        </div>
      </div>
    </section>
  );
};
