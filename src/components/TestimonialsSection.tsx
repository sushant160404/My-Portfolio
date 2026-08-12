import React, { useState } from 'react';
import { Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[currentIndex % testimonials.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const partners = ['Boltshift', 'Lightbox', 'FeatherDev', 'Spherule', 'GlobalBank'];

  return (
    <section id="testimonials" className="py-24 bg-[#121212] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MY TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CLIENT LOVED <span className="font-serif italic text-neutral-300 font-light">TESTIMONIAL</span>
          </h2>
        </div>

        {/* Partners Marquee Banner */}
        <div className="mb-16 py-6 border-y border-white/10 overflow-hidden">
          <div className="flex items-center justify-around flex-wrap gap-8 opacity-70">
            {partners.map((p) => (
              <span key={p} className="text-lg sm:text-xl font-black tracking-wider uppercase text-neutral-300 hover:text-[#CCFF00] transition-colors">
                ⚡ {p}
              </span>
            ))}
          </div>
        </div>

        {/* Active Testimonial Card */}
        <div className="bg-[#181818] border border-white/5 rounded-3xl p-8 lg:p-12 relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Quote & Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 5 Stars */}
              <div className="flex items-center gap-1 text-[#CCFF00]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#CCFF00]" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-neutral-200 text-lg sm:text-xl leading-relaxed italic font-serif">
                "{current.quote}"
              </p>

              {/* Author & Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-wrap gap-4">
                <div>
                  <h4 className="text-base font-black uppercase text-white tracking-wide">
                    {current.name}
                  </h4>
                  <p className="text-xs text-neutral-400 font-medium">
                    {current.role}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-[#CCFF00] flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full bg-[#CCFF00] text-black font-bold flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Avatar Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-[#CCFF00] overflow-hidden shadow-2xl">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
