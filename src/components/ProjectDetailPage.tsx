import React, { useEffect } from 'react';
import {
  ArrowLeft, ExternalLink, Github, CheckCircle2,
  Sparkles, Calendar, Layers, Code, ArrowRight, Share2, Check
} from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailPageProps {
  project: Project;
  allProjects: Project[];
  onBack: () => void;
  onSelectProject: (project: Project) => void;
  onOpenContact?: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  allProjects,
  onBack,
  onSelectProject,
  onOpenContact
}) => {
  const [copied, setCopied] = React.useState(false);

  // Scroll to top on project load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find next and previous projects for quick pagination
  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1];
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

  // Related projects in same category or fallback
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && (p.category === project.category || true))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white pt-24 pb-20 animate-fadeIn">
      
      {/* Sticky Top Navigation / Breadcrumbs */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#0E0E0E]/95 backdrop-blur-md border-b border-white/10 py-3 sm:py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#CCFF00] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#CCFF00]" />
            <span className="hidden xs:inline">Back to Projects</span>
            <span className="xs:hidden">Back</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Projects</span>
            <span>/</span>
            <span className="text-[#CCFF00] font-bold truncate max-w-[200px]">{project.category}</span>
            <span>/</span>
            <span className="text-white font-bold truncate max-w-[250px]">{project.title}</span>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 sm:gap-2 p-2 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors"
            title="Share Case Study"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Link Copied!' : 'Share Page'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 mt-8">
        
        {/* Page Hero Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider">
              {project.category}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Full Case Study</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-4xl leading-relaxed">
            {project.shortDescription}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105"
              >
                <span>Launch Live Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider hover:border-[#CCFF00] transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </div>

        {/* Featured Media Showcase */}
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl relative group">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>

        {/* Metadata Specs Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#141414] border border-white/10 rounded-2xl p-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Domain / Category
            </span>
            <p className="text-sm font-bold text-white uppercase">{project.category}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              Engineering Role
            </span>
            <p className="text-sm font-bold text-[#CCFF00] uppercase">Lead Full-Stack Architect</p>
          </div>

          <div className="space-y-1 col-span-2 md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
              Tech Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deep Overview Section */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
            <Sparkles className="w-4 h-4" />
            <span>EXECUTIVE SUMMARY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Project Overview & Scope
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
            {project.fullDescription || project.shortDescription}
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        {project.problem && project.solution && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Problem Box */}
            <div className="bg-[#141414] border border-red-500/30 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="text-lg font-black uppercase text-red-400 tracking-tight">
                The Core Challenge & Pain Points
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {project.problem}
              </p>
            </div>

            {/* Solution Box */}
            <div className="bg-[#141414] border border-[#CCFF00]/40 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#CCFF00] tracking-tight">
                The Engineering Solution Architecture
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>
        )}

        {/* Key Features & Engineering Highlights */}
        {project.features && project.features.length > 0 && (
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6">
            <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Code className="w-5 h-5 text-[#CCFF00]" />
              <span>Key Features & Deliverables</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.features.map((feat) => (
                <div
                  key={feat}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-900/80 border border-white/5 hover:border-[#CCFF00]/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-neutral-200 leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls (Prev / Next Project) */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onSelectProject(prevProject)}
            className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#CCFF00] text-left transition-all group flex flex-col justify-between"
          >
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>PREVIOUS PROJECT</span>
            </span>
            <span className="text-base font-black uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
              {prevProject.title}
            </span>
          </button>

          <button
            onClick={() => onSelectProject(nextProject)}
            className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#CCFF00] text-right transition-all group flex flex-col justify-between items-end"
          >
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-2">
              <span>NEXT PROJECT</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
            </span>
            <span className="text-base font-black uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
              {nextProject.title}
            </span>
          </button>
        </div>

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <div className="pt-12 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#CCFF00]" />
              <span>Explore More Case Studies</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-[#141414] border border-white/5 hover:border-[#CCFF00]/40 rounded-2xl p-4 cursor-pointer group transition-all space-y-3"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] font-bold uppercase tracking-wider inline-block">
                    {p.category}
                  </span>
                  <h4 className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {p.shortDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
