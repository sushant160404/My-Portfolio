import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { BlogDetailPage } from './components/BlogDetailPage';
import { BlogSection } from './components/BlogSection';
import { CommandPalette } from './components/CommandPalette';
import { AdminPanel } from './components/AdminPanel';
import { ChatBot } from './components/ChatBot';

import { Project, Service, Skill, Testimonial, Blog, SiteSettings } from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_SKILLS,
  INITIAL_PROJECTS,
  INITIAL_TESTIMONIALS,
  INITIAL_BLOGS
} from './lib/initialData';

import { db } from './lib/firebase';
import { collection, doc, getDocs, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [blogs, setBlogs] = useState<Blog[]>(INITIAL_BLOGS);

  // Modals state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Load content from Firestore or Express API
  const loadPortfolioData = useCallback(async () => {
    try {
      // 1. Settings
      const settingsDoc = await getDoc(doc(db, 'site_settings', 'main'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings);
      } else {
        // Express API fallback
        const res = await fetch('/api/settings');
        if (res.ok) {
          const apiSettings = await res.json();
          setSettings(prev => ({ ...prev, ...apiSettings }));
        }
      }

      // 2. Projects
      const projSnap = await getDocs(collection(db, 'projects'));
      const projList: Project[] = [];
      projSnap.forEach(d => projList.push({ id: d.id, ...d.data() } as Project));
      if (projList.length > 0) {
        setProjects(projList);
      }

      // 3. Services
      const servSnap = await getDocs(collection(db, 'services'));
      const servList: Service[] = [];
      servSnap.forEach(d => servList.push({ id: d.id, ...d.data() } as Service));
      if (servList.length > 0) {
        setServices(servList.sort((a, b) => a.order - b.order));
      }

      // 4. Skills
      const skillSnap = await getDocs(collection(db, 'skills'));
      const skillList: Skill[] = [];
      skillSnap.forEach(d => skillList.push({ id: d.id, ...d.data() } as Skill));
      if (skillList.length > 0) {
        setSkills(skillList);
      }

      // 5. Testimonials
      const testSnap = await getDocs(collection(db, 'testimonials'));
      const testList: Testimonial[] = [];
      testSnap.forEach(d => testList.push({ id: d.id, ...d.data() } as Testimonial));
      if (testList.length > 0) {
        setTestimonials(testList);
      }

      // 6. Blogs
      const blogSnap = await getDocs(collection(db, 'blogs'));
      const blogList: Blog[] = [];
      blogSnap.forEach(d => blogList.push({ id: d.id, ...d.data() } as Blog));
      if (blogList.length > 0) {
        setBlogs(blogList);
      }

    } catch (err) {
      console.warn('Firestore load warning, using initial preset:', err);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Handle selecting a blog post and incrementing its view/read count in Firestore & local state
  const handleSelectBlog = useCallback(async (blog: Blog) => {
    setSelectedProject(null);
    const newViews = (blog.views || 0) + 1;
    const updatedBlog: Blog = { ...blog, views: newViews };

    setSelectedBlog(updatedBlog);
    setBlogs(prev => prev.map(b => b.id === blog.id ? updatedBlog : b));

    try {
      const blogRef = doc(db, 'blogs', blog.id);
      await updateDoc(blogRef, { views: increment(1) });
    } catch (err) {
      try {
        await setDoc(doc(db, 'blogs', blog.id), { ...updatedBlog }, { merge: true });
      } catch (e) {
        console.warn('Could not update blog view count in Firestore:', e);
      }
    }
  }, []);

  // Dynamic Theme Application
  useEffect(() => {
    if (settings.theme) {
      const { accentColor, accentRgb, bgStyle, fontPreset } = settings.theme;
      if (accentColor) {
        document.documentElement.style.setProperty('--accent-color', accentColor);
      }
      if (accentRgb) {
        document.documentElement.style.setProperty('--accent-rgb', accentRgb);
      }
      
      // Apply body background mode
      if (bgStyle === 'midnight-navy') {
        document.body.style.backgroundColor = '#0A0F1D';
      } else if (bgStyle === 'slate-dark') {
        document.body.style.backgroundColor = '#0F172A';
      } else if (bgStyle === 'charcoal') {
        document.body.style.backgroundColor = '#121212';
      } else {
        document.body.style.backgroundColor = '#0E0E0E';
      }

      // Apply font preset
      if (fontPreset === 'serif') {
        document.body.style.fontFamily = 'Georgia, Cambria, "Times New Roman", Times, serif';
      } else if (fontPreset === 'mono') {
        document.body.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      } else {
        document.body.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      }
    }
  }, [settings.theme]);

  if (adminPanelOpen) {
    return (
      <AdminPanel
        isOpen={true}
        onClose={() => setAdminPanelOpen(false)}
        projects={projects}
        services={services}
        skills={skills}
        testimonials={testimonials}
        blogs={blogs}
        settings={settings}
        onRefreshData={loadPortfolioData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white selection:bg-[#CCFF00] selection:text-black font-sans antialiased">
      {/* Navbar */}
      <Header
        onOpenAdmin={() => setAdminPanelOpen(true)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onNavigateHome={() => {
          setSelectedProject(null);
          setSelectedBlog(null);
        }}
      />

      {selectedBlog ? (
        <BlogDetailPage
          blog={selectedBlog}
          allBlogs={blogs}
          onBack={() => setSelectedBlog(null)}
          onSelectBlog={handleSelectBlog}
        />
      ) : selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          allProjects={projects}
          onBack={() => setSelectedProject(null)}
          onSelectProject={(p) => {
            setSelectedBlog(null);
            setSelectedProject(p);
          }}
        />
      ) : (
        <>
          {/* Hero */}
          <Hero
            settings={settings}
            onOpenVideo={() => setVideoModalOpen(true)}
          />

          {/* About */}
          <AboutSection settings={settings} />

          {/* Services */}
          <ServicesSection services={services} />

          {/* Skills */}
          <SkillsSection skills={skills} />

          {/* Projects Showcase */}
          <ProjectsSection
            projects={projects}
            onSelectProject={(p) => {
              setSelectedBlog(null);
              setSelectedProject(p);
            }}
          />

          {/* Blog Section */}
          <BlogSection
            blogs={blogs}
            onSelectBlog={handleSelectBlog}
          />

          {/* Testimonials */}
          <TestimonialsSection testimonials={testimonials} />

          {/* Contact Form */}
          <ContactSection settings={settings} />

          {/* Newsletter Subscription */}
          <NewsletterSection />
        </>
      )}

      {/* Footer */}
      <Footer settings={settings} />

      {/* Interactive Modals */}
      {videoModalOpen && (
        <VideoModal
          videoUrl={settings.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
          onClose={() => setVideoModalOpen(false)}
        />
      )}

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        projects={projects}
        services={services}
        skills={skills}
        blogs={blogs}
        onSelectProject={(p) => {
          setSelectedBlog(null);
          setSelectedProject(p);
        }}
        onSelectBlog={handleSelectBlog}
        onOpenAdmin={() => setAdminPanelOpen(true)}
      />

      {/* Floating Groq AI ChatBot */}
      <ChatBot
        settings={settings}
        projects={projects}
        services={services}
        skills={skills}
        blogs={blogs}
        onOpenContact={() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProject={(p) => {
          setSelectedBlog(null);
          setSelectedProject(p);
        }}
        onSelectBlog={handleSelectBlog}
      />

      {/* Vercel Analytics */}
      <Analytics />
      
      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}
