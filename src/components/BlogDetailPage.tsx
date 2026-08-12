import React, { useEffect } from 'react';
import {
  ArrowLeft, Calendar, Clock, Eye, Share2, Check,
  Tag, ArrowRight, BookOpen, Globe, User, Sparkles
} from 'lucide-react';
import { Blog } from '../types';

interface BlogDetailPageProps {
  blog: Blog;
  allBlogs: Blog[];
  onBack: () => void;
  onSelectBlog: (blog: Blog) => void;
  onOpenContact?: () => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  blog,
  allBlogs,
  onBack,
  onSelectBlog,
  onOpenContact
}) => {
  const [copied, setCopied] = React.useState(false);

  // Scroll to top when blog post changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blog.id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find next and previous blogs for article pagination
  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : allBlogs[allBlogs.length - 1];
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : allBlogs[0];

  // Related blogs
  const relatedBlogs = allBlogs
    .filter((b) => b.id !== blog.id)
    .slice(0, 3);

  // Process article paragraphs cleanly
  const contentParagraphs = blog.content
    ? blog.content.split('\n\n').filter(Boolean)
    : [blog.excerpt];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white pt-24 pb-20 animate-fadeIn">
      
      {/* Sticky Top Navigation & Breadcrumbs Bar */}
      <div className="sticky top-16 z-40 bg-[#0E0E0E]/90 backdrop-blur-md border-b border-white/10 py-3.5 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#CCFF00] text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#CCFF00]" />
            <span>Back to Articles</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono truncate">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Blog</span>
            <span>/</span>
            <span className="text-[#CCFF00] font-bold">{blog.category}</span>
            <span>/</span>
            <span className="text-white font-bold truncate max-w-[200px]">{blog.title}</span>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors shrink-0"
            title="Share Article"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-8">
        
        {/* Article Meta Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider">
              {blog.category}
            </span>

            <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>{blog.publishedAt}</span>
            </span>

            <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>{blog.readTime}</span>
            </span>

            {blog.views && (
              <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>{blog.views} Views</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 leading-relaxed border-l-4 border-[#CCFF00] pl-4 italic">
            "{blog.excerpt}"
          </p>
        </div>

        {/* Featured Image Frame */}
        <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl relative group">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Full Article Content */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 text-neutral-200 leading-relaxed text-sm sm:text-base font-sans">
          {contentParagraphs.map((para, idx) => (
            <p key={idx} className="leading-relaxed">
              {para}
            </p>
          ))}

          {/* Deep Insight Callout Box */}
          <div className="p-6 rounded-2xl bg-[#1A1A1A] border-2 border-[#CCFF00]/30 space-y-3 my-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
              <Sparkles className="w-4 h-4" />
              <span>Key Takeaway & Design Rule</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 italic">
              "Great design systems aren't just collections of components—they are living standard operating procedures that align engineering speed with brand expression."
            </p>
          </div>

          {/* Article Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Article Tags:</span>
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Author Bio Card */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
            S
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold uppercase text-white">Sift Media Team</h4>
              <span className="px-2 py-0.5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[9px] font-mono uppercase font-bold">
                AUTHOR
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Crafting scalable web applications, modern UI/UX design systems, and high-performance engineering insights.
            </p>
          </div>
        </div>

        {/* SEO & Search Metadata Summary Box */}
        {(blog.seoTitle || blog.metaDescription) && (
          <div className="bg-[#101010] border border-white/5 rounded-2xl p-5 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-400 uppercase font-bold">
              <Globe className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Search Engine Optimization (SEO) Context</span>
            </div>
            <p className="text-neutral-300">
              <strong className="text-neutral-500">SEO Title:</strong> {blog.seoTitle || blog.title}
            </p>
            <p className="text-neutral-400 text-[11px]">
              <strong className="text-neutral-500">Meta Description:</strong> {blog.metaDescription || blog.excerpt}
            </p>
          </div>
        )}

        {/* Pagination Controls (Prev / Next Article) */}
        <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevBlog && (
            <button
              onClick={() => onSelectBlog(prevBlog)}
              className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#CCFF00] text-left transition-all group flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                <ArrowLeft className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>PREVIOUS ARTICLE</span>
              </span>
              <span className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                {prevBlog.title}
              </span>
            </button>
          )}

          {nextBlog && (
            <button
              onClick={() => onSelectBlog(nextBlog)}
              className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#CCFF00] text-right transition-all group flex flex-col justify-between items-end"
            >
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                <span>NEXT ARTICLE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
              </span>
              <span className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                {nextBlog.title}
              </span>
            </button>
          )}
        </div>

        {/* Related Articles Grid */}
        {relatedBlogs.length > 0 && (
          <div className="pt-10 space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#CCFF00]" />
              <span>More Insights & Articles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBlog(b)}
                  className="bg-[#141414] border border-white/5 hover:border-[#CCFF00]/40 rounded-2xl p-4 cursor-pointer group transition-all space-y-3"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900">
                    <img
                      src={b.featuredImage}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00] font-bold uppercase">
                      {b.category}
                    </span>
                    <span>{b.readTime}</span>
                  </div>
                  <h4 className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-2">
                    {b.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {b.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
};
