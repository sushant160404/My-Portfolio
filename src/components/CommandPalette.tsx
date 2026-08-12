import React, { useState, useEffect } from 'react';
import { Search, X, Folder, Layers, Shield, Sparkles, BookOpen } from 'lucide-react';
import { Project, Service, Skill, Blog } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  services: Service[];
  skills: Skill[];
  blogs?: Blog[];
  onSelectProject: (p: Project) => void;
  onSelectBlog?: (b: Blog) => void;
  onOpenAdmin: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  services,
  skills,
  blogs = [],
  onSelectProject,
  onSelectBlog,
  onOpenAdmin
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          const trigger = document.getElementById('search-palette-trigger');
          if (trigger) trigger.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.shortDescription.toLowerCase().includes(query.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSkills = skills.filter(sk =>
    sk.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    b.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#161616] border border-white/10 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-white space-y-3">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#CCFF00]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search projects, skills..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          
          {/* Admin shortcut */}
          <div
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 hover:bg-[#CCFF00]/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-[#CCFF00] uppercase">
              <Shield className="w-4 h-4" />
              <span>Open Admin CMS Portal</span>
            </div>
            <span className="text-[10px] text-neutral-400">Manage Portfolio</span>
          </div>

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block">
                Projects
              </span>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onSelectProject(p);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <Folder className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold uppercase text-white">{p.title}</h5>
                    <p className="text-[11px] text-neutral-400 truncate">{p.shortDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blogs */}
          {filteredBlogs.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block">
                Articles & Blog
              </span>
              {filteredBlogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    onClose();
                    if (onSelectBlog) onSelectBlog(b);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold uppercase text-white">{b.title}</h5>
                    <p className="text-[11px] text-neutral-400 truncate">{b.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Services */}
          {filteredServices.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block">
                Services
              </span>
              {filteredServices.map((s) => (
                <a
                  key={s.id}
                  href="#services"
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#CCFF00] shrink-0" />
                  <span className="text-xs font-bold uppercase text-white">{s.title}</span>
                </a>
              ))}
            </div>
          )}

          {/* Skills */}
          {filteredSkills.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block">
                Skills
              </span>
              <div className="flex flex-wrap gap-2 p-2">
                {filteredSkills.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-200"
                  >
                    {sk.name} ({sk.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-neutral-950 flex items-center justify-between text-[10px] text-neutral-500 px-4">
          <span>Navigate with mouse or click</span>
          <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800">ESC to close</kbd>
        </div>

      </div>
    </div>
  );
};
