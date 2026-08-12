import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, Tag, Search, Eye } from 'lucide-react';
import { Blog } from '../types';

interface BlogSectionProps {
  blogs: Blog[];
  onSelectBlog: (blog: Blog) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogs, onSelectBlog }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!blogs || blogs.length === 0) return null;

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(blogs.map((b) => b.category)))];

  // Filtered list
  const filteredBlogs = selectedCategory === 'ALL'
    ? blogs
    : blogs.filter((b) => b.category === selectedCategory);

  return (
    <section id="blog" className="py-20 bg-[#0E0E0E] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-mono font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>INSIGHTS & ARTICLES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Tech Blog & Thought Leadership
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              In-depth articles covering modern UI/UX design systems, full-stack REST API engineering, and digital growth strategies.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#CCFF00] text-black shadow-lg scale-105'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => onSelectBlog(blog)}
              className="bg-[#141414] border border-white/10 hover:border-[#CCFF00] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-xl"
            >
              <div className="space-y-4 p-6">
                {/* Thumbnail */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 relative">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[#CCFF00] text-[10px] font-mono font-bold uppercase tracking-wider">
                      {blog.category}
                    </span>
                  </div>
                </div>

                {/* Article Info */}
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>{blog.publishedAt}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Read count">
                    <Eye className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>{(blog.views ?? 0).toLocaleString()} reads</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>{blog.readTime}</span>
                  </span>
                </div>

                {/* Title & Excerpt */}
                <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition-colors leading-snug line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                  <Tag className="w-3 h-3 text-[#CCFF00]" />
                  <span>{blog.tags?.[0] || 'Tech'}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#CCFF00] group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
