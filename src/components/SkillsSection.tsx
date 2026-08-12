import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Skill } from '../types';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section id="skills" className="py-24 bg-[#121212] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Skill Percentage Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-[#181818] border border-white/5 hover:border-[#CCFF00]/40 rounded-2xl p-5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center p-1.5 text-[#CCFF00] font-bold text-xs">
                      {skill.name.substring(0, 2)}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#CCFF00]">
                      {skill.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white">{skill.percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#CCFF00] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Narrative + CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MY SKILLS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              LET'S EXPLORE POPULAR <br />
              SKILLS AND <span className="font-serif italic text-neutral-300 font-light">EXPERIENCE</span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              At Sift, we offer comprehensive UI/UX design and development services aimed at creating exceptional digital experiences that seamlessly blend aesthetics with functionality. Our holistic approach a deep ui/ux design development skills.
            </p>

            <div className="pt-2">
              <a
                href="#contact"
                id="get-in-touch-skills-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              >
                <span>GET IN TOUCH NOW</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
