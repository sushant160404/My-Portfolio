import React, { useState } from 'react';
import { Sparkles, Layout, Code2, Layers, Globe, Terminal, Tag, ArrowRight, X } from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout': return <Layout className="w-5 h-5 text-black" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-black" />;
      case 'Layers': return <Layers className="w-5 h-5 text-black" />;
      case 'Globe': return <Globe className="w-5 h-5 text-black" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-black" />;
      case 'Tag': return <Tag className="w-5 h-5 text-black" />;
      default: return <Sparkles className="w-5 h-5 text-black" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-[#0E0E0E] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MY SERVICE PROVIDE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            MY BEST QUALITY <span className="font-serif italic text-neutral-300 font-light">SERVICE</span>
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#141414] border border-white/5 hover:border-[#CCFF00]/40 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group shadow-xl"
            >
              <div className="space-y-4">
                {/* Lime Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] group-hover:scale-110 transition-transform">
                  {getIcon(service.icon)}
                </div>

                {/* Service Title */}
                <h3 className="text-lg font-black uppercase tracking-wide text-white group-hover:text-[#CCFF00] transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-4">
                  {service.description}
                </p>
              </div>

              {/* Read More Action */}
              <div className="pt-6 mt-4 border-t border-white/5">
                <button
                  onClick={() => setSelectedService(service)}
                  className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-all flex items-center gap-1.5"
                >
                  <span>READ MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 max-w-lg w-full relative space-y-5 shadow-2xl">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center">
              {getIcon(selectedService.icon)}
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight text-white">
              {selectedService.title}
            </h3>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {selectedService.description}
            </p>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                Key Service Deliverables:
              </h4>
              <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
                <li>Bespoke responsive design & rapid prototyping</li>
                <li>Performance-optimized web architecture</li>
                <li>Cross-browser compatibility & clean code standards</li>
                <li>Dedicated support & ongoing optimization</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href="#contact"
                onClick={() => setSelectedService(null)}
                className="px-6 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600]"
              >
                Request This Service
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
