import React from 'react';
import { X, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface CaseStudyModalProps {
  project: Project;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141414] border border-white/10 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white relative">
        
        {/* Sticky Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A] shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold uppercase tracking-wider">
              {project.category}
            </span>
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white truncate max-w-xl">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition-colors shrink-0"
            title="Close Case Study"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Main Showcase Image & Quick Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 relative group">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="lg:col-span-4 bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Project Domain
                </span>
                <p className="text-xs font-bold text-white uppercase">{project.category}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Technologies Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-colors shadow-md"
                  >
                    <span>Launch Live App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider hover:border-[#CCFF00] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Overview */}
          <div className="space-y-4 bg-[#181818] border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
              Full Case Study Overview
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed font-normal">
              {project.fullDescription || project.shortDescription}
            </p>
          </div>

          {/* Problem & Solution Grid */}
          {project.problem && project.solution && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#181818] border border-red-500/20 rounded-2xl p-6 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <span>The Challenge & Problem</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {project.problem}
                </p>
              </div>

              <div className="bg-[#181818] border border-[#CCFF00]/30 rounded-2xl p-6 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                  <span>The Solution Architecture</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>
          )}

          {/* Key Engineering Highlights */}
          {project.features && project.features.length > 0 && (
            <div className="space-y-3 bg-[#181818] border border-white/10 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                Key Engineering Highlights & Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-neutral-200 bg-neutral-900/60 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#1A1A1A] flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-colors"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider hover:border-[#CCFF00] transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
};
