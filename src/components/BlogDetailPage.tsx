import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Calendar, Clock, Eye, Share2, Check, Heart,
  Tag, ArrowRight, BookOpen, Globe, User, Sparkles,
  Code, Image as ImageIcon, List, Quote, AlertCircle,
  Link as LinkIcon, ChevronRight, Menu, Play, MonitorPlay
} from 'lucide-react';
import { Blog, BlogContentBlock } from '../types';

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
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const handleLike = () => {
    setLiked(!liked);
  };

  // Generate table of contents from contentBlocks
  const tableOfContents = useMemo(() => {
    if (!blog.contentBlocks || !blog.tableOfContents) return [];
    return blog.contentBlocks
      .filter(block => block.type === 'heading' && block.level && block.level <= 3)
      .map((block, idx) => ({
        id: `heading-${idx}`,
        text: block.content,
        level: block.level || 1
      }));
  }, [blog.contentBlocks, blog.tableOfContents]);

  // Find next and previous blogs for article pagination
  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : allBlogs[allBlogs.length - 1];
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : allBlogs[0];

  // Related blogs
  const relatedBlogs = allBlogs
    .filter((b) => b.id !== blog.id && b.category === blog.category)
    .slice(0, 3);

  // Fallback to simple content if no contentBlocks
  const contentParagraphs = blog.content
    ? blog.content.split('\n\n').filter(Boolean)
    : [blog.excerpt];

  // Render content block based on type
  const renderContentBlock = (block: BlogContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-12 mb-6',
          2: 'text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-10 mb-5',
          3: 'text-xl sm:text-2xl font-bold text-white mt-8 mb-4',
          4: 'text-lg sm:text-xl font-semibold text-white mt-6 mb-3',
          5: 'text-base sm:text-lg font-semibold text-white mt-5 mb-3',
          6: 'text-sm sm:text-base font-semibold text-white mt-4 mb-2'
        };
        return (
          <HeadingTag
            key={index}
            id={`heading-${index}`}
            className={headingClasses[block.level as keyof typeof headingClasses] || headingClasses[2]}
          >
            {block.content}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={index} className="leading-relaxed text-neutral-200 mb-4">
            {block.content}
          </p>
        );

      case 'image':
        return (
          <figure key={index} className="my-8 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
              <img
                src={block.content}
                alt={block.caption || 'Blog image'}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/1200x675/141414/CCFF00?text=Image';
                }}
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-neutral-400 text-center italic flex items-center justify-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'code':
        return (
          <div key={index} className="my-6 rounded-xl overflow-hidden border border-white/10">
            <div className="bg-[#1A1A1A] px-4 py-2 flex items-center justify-between border-b border-white/10">
              <span className="text-xs font-mono text-[#CCFF00] uppercase font-bold flex items-center gap-2">
                <Code className="w-3.5 h-3.5" />
                {block.language || 'code'}
              </span>
            </div>
            <pre className="bg-[#0A0A0A] p-4 overflow-x-auto">
              <code className="text-sm font-mono text-neutral-300 whitespace-pre">
                {block.content}
              </code>
            </pre>
          </div>
        );

      case 'quote':
        return (
          <blockquote key={index} className="my-8 pl-6 border-l-4 border-[#CCFF00] bg-[#1A1A1A] p-6 rounded-r-2xl">
            <Quote className="w-8 h-8 text-[#CCFF00] opacity-30 mb-3" />
            <p className="text-base sm:text-lg text-neutral-200 italic leading-relaxed">
              {block.content}
            </p>
          </blockquote>
        );

      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            key={index}
            className={`my-6 space-y-3 ${block.ordered ? 'list-decimal' : 'list-disc'} list-inside text-neutral-200`}
          >
            {block.items?.map((item, i) => (
              <li key={i} className="leading-relaxed flex items-start gap-3">
                {!block.ordered && <ChevronRight className="w-4 h-4 text-[#CCFF00] mt-1 shrink-0" />}
                <span className={block.ordered ? '' : '-ml-7'}>{item}</span>
              </li>
            ))}
          </ListTag>
        );

      case 'divider':
        return (
          <hr key={index} className="my-10 border-t border-white/10" />
        );

      case 'callout':
        const calloutStyles = {
          info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          success: 'bg-green-500/10 border-green-500/30 text-green-400',
          tip: 'bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00]'
        };
        const style = block.style || 'tip';
        return (
          <div
            key={index}
            className={`my-6 p-6 rounded-2xl border-2 ${calloutStyles[style]} space-y-3`}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{style === 'tip' ? 'Pro Tip' : style.charAt(0).toUpperCase() + style.slice(1)}</span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {block.content}
            </p>
          </div>
        );

      case 'video':
        return (
          <figure key={index} className="my-8 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 aspect-video">
              <video
                src={block.url || block.content}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-neutral-400 text-center italic flex items-center justify-center gap-2">
                <Play className="w-3.5 h-3.5 text-[#CCFF00]" />
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'embed':
        return (
          <figure key={index} className="my-8 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 aspect-video">
              <iframe
                src={block.url || block.content}
                title={block.caption || 'Embedded content'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-neutral-400 text-center italic flex items-center justify-center gap-2">
                <MonitorPlay className="w-3.5 h-3.5 text-[#CCFF00]" />
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white pt-24 pb-20 animate-fadeIn">
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-[#CCFF00] transition-all duration-75" style={{ width: `${readProgress}%` }} />

      {/* Sticky Top Navigation & Breadcrumbs Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#0E0E0E]/95 backdrop-blur-md border-b border-white/10 py-3 sm:py-3.5 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#CCFF00] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#CCFF00]" />
            <span className="hidden xs:inline">Back to Articles</span>
            <span className="xs:hidden">Back</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 font-mono truncate">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Blog</span>
            <span>/</span>
            <span className="text-[#CCFF00] font-bold">{blog.category}</span>
            <span>/</span>
            <span className="text-white font-bold truncate max-w-[200px]">{blog.title}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {tableOfContents.length > 0 && (
              <button
                onClick={() => setShowTOC(!showTOC)}
                className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors shrink-0"
                title="Table of Contents"
              >
                <Menu className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">TOC</span>
              </button>
            )}
            
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border transition-colors shrink-0 ${
                liked 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Like Article"
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline text-xs">{(blog.likes || 0) + (liked ? 1 : 0)}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 sm:gap-2 p-2 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors shrink-0"
              title="Share Article"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table of Contents Sidebar */}
      {showTOC && tableOfContents.length > 0 && (
        <div className="fixed right-8 top-32 w-64 bg-[#141414] border border-white/10 rounded-2xl p-4 z-20 max-h-[70vh] overflow-y-auto hidden xl:block">
          <h4 className="text-xs font-bold uppercase text-[#CCFF00] mb-3 flex items-center gap-2">
            <Menu className="w-3.5 h-3.5" />
            Table of Contents
          </h4>
          <ul className="space-y-2">
            {tableOfContents.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`text-xs text-neutral-400 hover:text-white transition block ${
                    item.level === 1 ? 'font-bold' : item.level === 2 ? 'pl-3' : 'pl-6'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

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

            {blog.updatedAt && blog.updatedAt !== blog.publishedAt && (
              <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono">
                Updated: {blog.updatedAt}
              </span>
            )}

            <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>{blog.readTime}</span>
            </span>

            {blog.views && (
              <span className="px-3 py-1.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>{blog.views.toLocaleString()} Views</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 leading-relaxed border-l-4 border-[#CCFF00] pl-4 italic">
            "{blog.excerpt}"
          </p>

          {/* Author Info */}
          {blog.author && (
            <div className="flex items-center gap-3 pt-4">
              {blog.author.avatar ? (
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-10 h-10 rounded-full border-2 border-[#CCFF00]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-bold text-sm">
                  {blog.author.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{blog.author.name}</p>
                {blog.author.role && (
                  <p className="text-xs text-neutral-400">{blog.author.role}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Featured Image Frame */}
        <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl relative group">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/1200x675/141414/CCFF00?text=Blog+Image';
            }}
            loading="lazy"
            crossOrigin="anonymous"
          />
        </div>

        {/* Full Article Content */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-10 text-neutral-200 leading-relaxed text-sm sm:text-base font-sans">
          {blog.contentBlocks && blog.contentBlocks.length > 0 ? (
            blog.contentBlocks.map((block, index) => renderContentBlock(block, index))
          ) : (
            <div className="space-y-6">
              {contentParagraphs.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Article Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-8 mt-8 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mr-2">
                <Tag className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Tags:</span>
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-300 hover:border-[#CCFF00] hover:text-[#CCFF00] transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Author Bio Card */}
        {blog.author ? (
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 flex items-start gap-5">
            {blog.author.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-16 h-16 rounded-2xl border-2 border-[#CCFF00] shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
                {blog.author.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold uppercase text-white">{blog.author.name}</h4>
                <span className="px-2 py-0.5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[9px] font-mono uppercase font-bold">
                  AUTHOR
                </span>
              </div>
              {blog.author.role && (
                <p className="text-xs text-[#CCFF00] font-mono">{blog.author.role}</p>
              )}
              {blog.author.bio && (
                <p className="text-xs text-neutral-400 leading-relaxed pt-1">
                  {blog.author.bio}
                </p>
              )}
            </div>
          </div>
        ) : (
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
        )}

        {/* SEO & Search Metadata Summary Box */}
        {(blog.seoTitle || blog.metaDescription) && (
          <div className="bg-[#101010] border border-white/5 rounded-2xl p-5 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-400 uppercase font-bold">
              <Globe className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>SEO Metadata</span>
            </div>
            <p className="text-neutral-300">
              <strong className="text-neutral-500">Title:</strong> {blog.seoTitle || blog.title}
            </p>
            <p className="text-neutral-400 text-[11px]">
              <strong className="text-neutral-500">Description:</strong> {blog.metaDescription || blog.excerpt}
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
                <span>PREVIOUS</span>
              </span>
              <span className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-2">
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
                <span>NEXT</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
              </span>
              <span className="text-sm font-bold uppercase text-white group-hover:text-[#CCFF00] transition-colors line-clamp-2">
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
              <span>Related Articles</span>
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/800x600/141414/CCFF00?text=Blog';
                      }}
                      loading="lazy"
                      crossOrigin="anonymous"
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
