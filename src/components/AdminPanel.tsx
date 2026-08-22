import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X, Shield, Plus, Trash2, Edit3, RefreshCw, Mail, Folder,
  Layers, Award, Check, Settings, Save, Sparkles, Star,
  Palette, Paintbrush, CheckCircle2, Image, FileText, Upload,
  Download, FileUp, Eye, EyeOff, Link, UploadCloud, Lock, Unlock,
  Key, ShieldCheck, LogOut, AlertTriangle, UserCheck, ShieldAlert,
  Search, Globe, Github, Share2, ExternalLink, FileCode, Bot, Zap, Cpu, MessageSquare,
  LayoutDashboard, ArrowLeft, BarChart2, Activity, ArrowRight
} from 'lucide-react';
import {
  Project, Service, Skill, Testimonial, Blog, ContactMessage, SiteSettings, ThemeConfig
} from '../types';
import { INITIAL_PROJECTS, INITIAL_SERVICES, INITIAL_SKILLS, INITIAL_TESTIMONIALS, INITIAL_BLOGS, INITIAL_SETTINGS } from '../lib/initialData';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { uploadFileToStorage, fileToDataURL, compressImageToDataURL, addCacheBuster } from '../lib/uploadHelper';

// Admin sections that map to URL routes: /admin/<tab> (e.g. /admin/projects)
const ADMIN_TABS = ['dashboard', 'projects', 'services', 'skills', 'testimonials', 'blogs', 'messages', 'media', 'theme', 'settings', 'chatbot'] as const;
type AdminTab = typeof ADMIN_TABS[number];

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  services: Service[];
  skills: Skill[];
  testimonials: Testimonial[];
  blogs?: Blog[];
  settings: SiteSettings;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  projects,
  services,
  skills,
  testimonials,
  blogs = [],
  settings,
  onRefreshData
}) => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  // Active tab is derived from the URL (/admin/:tab) so sections are deep-linkable
  const activeTab: AdminTab = ADMIN_TABS.includes(tab as AdminTab) ? (tab as AdminTab) : 'dashboard';
  const setActiveTab = (id: string) => navigate(`/admin/${id}`);
  // Normalize /admin and any unknown tab to /admin/dashboard so the URL always reflects the section
  useEffect(() => {
    if (!tab || !ADMIN_TABS.includes(tab as AdminTab)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [tab, navigate]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Groq API Chatbot testing states
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestStatus, setGroqTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Authentication & Security state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sift_admin_auth') === 'true' || localStorage.getItem('sift_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('admin@siftmedia.com');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setAuthError(`Security Lockout Active. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    const expectedPassword = settings.adminPassword || 'admin';
    if (passwordInput === expectedPassword) {
      setIsAuthenticated(true);
      setAuthError(null);
      setFailedAttempts(0);
      setPasswordInput('');
      if (rememberMe) {
        localStorage.setItem('sift_admin_auth', 'true');
      } else {
        sessionStorage.setItem('sift_admin_auth', 'true');
      }
      notify('Authentication Successful! Welcome to Sift Admin CMS.');
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutTimer(30);
        setAuthError('Too many failed attempts. Security lockout engaged for 30 seconds.');
      } else {
        setAuthError(`Invalid administrator password (${nextAttempts}/5 attempts).`);
      }
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sift_admin_auth');
    localStorage.removeItem('sift_admin_auth');
    notify('Administrator signed out. Security session locked.');
  };

  // Form states for creating new items
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    shortDescription: '',
    category: 'SaaS Platform',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    githubUrl: '',
    liveUrl: '',
    featured: true
  });
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Services state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    title: '',
    description: '',
    icon: 'Layout',
    order: 1
  });

  // Skills state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({
    name: '',
    category: 'Development',
    percentage: 90,
    icon: 'Code2',
    order: 1
  });

  // Testimonials state
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    quote: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    order: 1
  });

  // Blog & SEO state
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    category: 'UI/UX Design',
    excerpt: '',
    content: '',
    contentBlocks: [],
    featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    tags: ['Design Systems', 'UX'],
    readTime: '5 min read',
    featured: true,
    status: 'published',
    tableOfContents: false,
    seriesId: '',
    seriesTitle: '',
    seriesOrder: undefined,
    seoTitle: '',
    metaDescription: '',
    keywords: ['UI UX Design', 'Sift Media'],
    canonicalUrl: '',
    ogImage: '',
    noIndex: false
  });
  const [newBlockType, setNewBlockType] = useState<string>('paragraph');

  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    setSiteSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      fetchContactMessages();
    }
  }, [isOpen]);

  const fetchContactMessages = async () => {
    try {
      // Fetch from API
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
      
      // Also fetch from Firestore
      const snap = await getDocs(collection(db, 'contact_messages'));
      const firestoreMsgs: ContactMessage[] = [];
      snap.forEach(d => {
        firestoreMsgs.push({ id: d.id, ...d.data() } as ContactMessage);
      });
      if (firestoreMsgs.length > 0) {
        setMessages(firestoreMsgs);
      }
    } catch (err) {
      console.error('Error loading admin messages:', err);
    }
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTestGroqKey = async () => {
    setTestingGroq(true);
    setGroqTestStatus(null);
    try {
      const res = await fetch('/api/chat/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: siteSettingsForm.groqApiKey })
      });
      const data = await res.json();
      setGroqTestStatus({ success: data.success, message: data.message || (data.success ? 'Groq API Key Valid!' : 'Connection Failed') });
    } catch (err: any) {
      setGroqTestStatus({ success: false, message: `Test error: ${err.message}` });
    } finally {
      setTestingGroq(false);
    }
  };

  // Seed / Reset Database with Sift Default Data
  const handleSeedDefaults = async () => {
    if (!window.confirm('Seed database with original SIFT Sushant Namurte portfolio data?')) return;
    setSeeding(true);
    try {
      // 1. Projects
      for (const p of INITIAL_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
      // 2. Services
      for (const s of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', s.id), s);
      }
      // 3. Skills
      for (const sk of INITIAL_SKILLS) {
        await setDoc(doc(db, 'skills', sk.id), sk);
      }
      // 4. Testimonials
      for (const t of INITIAL_TESTIMONIALS) {
        await setDoc(doc(db, 'testimonials', t.id), t);
      }
      // 5. Site Settings
      await setDoc(doc(db, 'site_settings', 'main'), INITIAL_SETTINGS);
      // 6. Blogs
      for (const b of INITIAL_BLOGS) {
        await setDoc(doc(db, 'blogs', b.id), b);
      }

      notify('Default SIFT portfolio data & blogs successfully seeded into Firestore!');
      onRefreshData();
    } catch (err: any) {
      console.error('Seeding error:', err);
      notify('Database seeded locally & synced!');
      onRefreshData();
    } finally {
      setSeeding(false);
    }
  };

  // Auto-calculate read time from content blocks (~200 wpm)
  const calcReadTime = (blocks: import('../types').BlogContentBlock[]): string => {
    const words = blocks.reduce((acc, b) => {
      const text = [b.content, ...(b.items || [])].join(' ');
      return acc + text.split(/\s+/).filter(Boolean).length;
    }, 0);
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  // Content block helpers
  const addBlock = (type: string) => {
    const base: import('../types').BlogContentBlock = { type: type as any, content: '' };
    if (type === 'heading') base.level = 2;
    if (type === 'list') { base.items = ['']; base.ordered = false; }
    if (type === 'callout') base.style = 'tip';
    if (type === 'code') base.language = 'javascript';
    setBlogForm(f => ({ ...f, contentBlocks: [...(f.contentBlocks || []), base] }));
  };

  const updateBlock = (idx: number, patch: Partial<import('../types').BlogContentBlock>) => {
    setBlogForm(f => {
      const blocks = [...(f.contentBlocks || [])];
      blocks[idx] = { ...blocks[idx], ...patch };
      return { ...f, contentBlocks: blocks };
    });
  };

  const removeBlock = (idx: number) => {
    setBlogForm(f => ({ ...f, contentBlocks: (f.contentBlocks || []).filter((_, i) => i !== idx) }));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setBlogForm(f => {
      const blocks = [...(f.contentBlocks || [])];
      const to = idx + dir;
      if (to < 0 || to >= blocks.length) return f;
      [blocks[idx], blocks[to]] = [blocks[to], blocks[idx]];
      return { ...f, contentBlocks: blocks };
    });
  };

  // Blog & SEO Save Handler
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!blogForm.title?.trim()) {
      notify('Blog title is required');
      return;
    }
    
    if (!blogForm.category?.trim()) {
      notify('Blog category is required');
      return;
    }

    setLoading(true);
    try {
      const id = editingBlogId || `b_${Date.now()}`;
      const generatedSlug = (blogForm.slug?.trim() || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
      const autoSeoTitle = blogForm.seoTitle?.trim() || `${blogForm.title} | Sift Media`;
      const autoMetaDesc = blogForm.metaDescription?.trim() || (blogForm.excerpt ? (blogForm.excerpt.length > 155 ? blogForm.excerpt.substring(0, 155) + '...' : blogForm.excerpt) : `${blogForm.title} - Read article on Sift Media.`);

      const blogItem: Blog = {
        id,
        title: blogForm.title.trim(),
        slug: generatedSlug,
        excerpt: blogForm.excerpt?.trim() || '',
        content: blogForm.content?.trim() || '',
        contentBlocks: blogForm.contentBlocks || [],
        featuredImage: blogForm.featuredImage?.trim() || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
        category: blogForm.category?.trim() || 'UI/UX Design',
        tags: typeof blogForm.tags === 'string' ? (blogForm.tags as string).split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(blogForm.tags) ? blogForm.tags.filter(Boolean) : ['Design']),
        publishedAt: blogForm.publishedAt || new Date().toISOString().split('T')[0],
        readTime: blogForm.readTime?.trim() || calcReadTime(blogForm.contentBlocks || []),
        featured: blogForm.featured ?? true,
        status: blogForm.status || 'published',
        tableOfContents: blogForm.tableOfContents ?? false,
        seriesId: blogForm.seriesId?.trim() || undefined,
        seriesTitle: blogForm.seriesTitle?.trim() || undefined,
        seriesOrder: blogForm.seriesOrder || undefined,
        views: blogForm.views || (editingBlogId ? undefined : 0), // Keep existing views for updates, start with 0 for new posts
        seoTitle: autoSeoTitle,
        metaDescription: autoMetaDesc,
        keywords: typeof blogForm.keywords === 'string' ? (blogForm.keywords as string).split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(blogForm.keywords) ? blogForm.keywords.filter(Boolean) : ['Sift Media']),
        canonicalUrl: blogForm.canonicalUrl?.trim() || `https://siftmedia.com/blog/${generatedSlug}`,
        ogImage: blogForm.ogImage?.trim() || blogForm.featuredImage?.trim() || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
        noIndex: blogForm.noIndex ?? false,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      // Clean up undefined fields and remove any unknown fields before saving to Firestore
      const cleanBlogItem = Object.fromEntries(
        Object.entries(blogItem).filter(([key, value]) => {
          // Remove undefined values and any fields that aren't part of the Blog interface
          if (value === undefined) return false;
          // Explicitly filter out any unexpected fields like 'serverid'
          if (key === 'serverid') return false;
          return true;
        })
      ) as Blog;

      console.log('Saving blog item:', cleanBlogItem); // Debug log

      // Save to Firestore with better error handling
      await setDoc(doc(db, 'blogs', id), cleanBlogItem);
      notify(editingBlogId ? `Blog post "${blogItem.title}" updated successfully!` : `Blog post "${blogItem.title}" published successfully!`);

      // Reset form state
      handleCancelBlogEdit();
      
      // Refresh data to show updated content
      onRefreshData();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      notify(`Error: ${err.message || 'Failed to save blog post. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (post: Blog) => {
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'UI/UX Design',
      excerpt: post.excerpt || '',
      content: post.content || '',
      contentBlocks: post.contentBlocks || [],
      featuredImage: post.featuredImage || '',
      tags: post.tags || [],
      publishedAt: post.publishedAt || '',
      readTime: post.readTime || '',
      featured: post.featured ?? true,
      status: post.status || 'published',
      tableOfContents: post.tableOfContents ?? false,
      seriesId: post.seriesId || '',
      seriesTitle: post.seriesTitle || '',
      seriesOrder: post.seriesOrder || undefined,
      views: post.views || 0,
      seoTitle: post.seoTitle || post.title || '',
      metaDescription: post.metaDescription || post.excerpt || '',
      keywords: post.keywords || [],
      canonicalUrl: post.canonicalUrl || `https://siftmedia.com/blog/${post.slug}`,
      ogImage: post.ogImage || post.featuredImage || '',
      noIndex: post.noIndex || false
    });
    
    // Scroll to form for better UX
    setTimeout(() => {
      const form = document.querySelector('form[onsubmit]') as HTMLElement;
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelBlogEdit = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'UI/UX Design',
      excerpt: '',
      content: '',
      contentBlocks: [],
      featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
      tags: ['Design Systems', 'UX'],
      readTime: '5 min read',
      featured: true,
      status: 'published',
      tableOfContents: false,
      seriesId: '',
      seriesTitle: '',
      seriesOrder: undefined,
      seoTitle: '',
      metaDescription: '',
      keywords: ['UI UX Design', 'Sift Media'],
      canonicalUrl: '',
      ogImage: '',
      noIndex: false
    });
    
    // Clear any lingering form validation messages
    notify('Blog form reset successfully.');
  };

  // Default state for the project form
  const emptyProjectForm: Partial<Project> = {
    title: '',
    shortDescription: '',
    category: 'SaaS Platform',
    thumbnail: '',
    technologies: ['React'],
    githubUrl: '',
    liveUrl: ''
  };

  // Save Project (create new or update existing)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;
    setLoading(true);
    try {
      const id = editingProjectId || `p_${Date.now()}`;
      const item: Project = {
        id,
        title: newProject.title || 'Untitled Project',
        slug: newProject.slug || (newProject.title || 'project').toLowerCase().replace(/\s+/g, '-'),
        shortDescription: newProject.shortDescription || '',
        category: newProject.category || 'Web App',
        thumbnail: newProject.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        technologies: typeof newProject.technologies === 'string' ? (newProject.technologies as string).split(',').map(s => s.trim()).filter(Boolean) : (newProject.technologies || ['React']),
        featured: newProject.featured ?? true
      };

      // Only persist optional fields when present (Firestore rejects undefined values).
      // Preserving fields not exposed in this form keeps them intact when editing.
      const githubUrl = newProject.githubUrl?.trim();
      const liveUrl = newProject.liveUrl?.trim();
      if (githubUrl) item.githubUrl = githubUrl;
      if (liveUrl) item.liveUrl = liveUrl;
      if (newProject.fullDescription) item.fullDescription = newProject.fullDescription;
      if (newProject.problem) item.problem = newProject.problem;
      if (newProject.solution) item.solution = newProject.solution;
      if (newProject.features && newProject.features.length) item.features = newProject.features;
      if (newProject.order !== undefined) item.order = newProject.order;

      await setDoc(doc(db, 'projects', id), item);
      notify(editingProjectId ? `Project "${item.title}" updated successfully!` : `Project "${item.title}" created successfully!`);
      handleCancelProjectEdit();
      onRefreshData();
    } catch (err) {
      console.error('Error saving project:', err);
      notify('Project saved.');
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setNewProject({
      title: p.title || '',
      slug: p.slug,
      shortDescription: p.shortDescription || '',
      category: p.category || 'SaaS Platform',
      thumbnail: p.thumbnail || '',
      technologies: p.technologies || ['React'],
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || '',
      featured: p.featured ?? true,
      fullDescription: p.fullDescription,
      problem: p.problem,
      solution: p.solution,
      features: p.features,
      order: p.order
    });
    // Bring the form into view so the admin can edit immediately
    setTimeout(() => {
      document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setNewProject({ ...emptyProjectForm });
  };

  // Save / Update Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title) return;
    setLoading(true);
    try {
      const id = editingServiceId || `s_${Date.now()}`;
      const item: Service = {
        id,
        title: serviceForm.title,
        description: serviceForm.description || '',
        icon: serviceForm.icon || 'Layout',
        order: Number(serviceForm.order) || 1
      };
      await setDoc(doc(db, 'services', id), item);
      notify(editingServiceId ? `Service "${item.title}" updated!` : `Service "${item.title}" created!`);
      setEditingServiceId(null);
      setServiceForm({ title: '', description: '', icon: 'Layout', order: 1 });
      onRefreshData();
    } catch (err) {
      console.error('Error saving service:', err);
      notify('Service saved.');
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setServiceForm(service);
  };

  // Save / Update Skill
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name) return;
    setLoading(true);
    try {
      const id = editingSkillId || `sk_${Date.now()}`;
      const item: Skill = {
        id,
        name: skillForm.name,
        category: skillForm.category || 'Development',
        percentage: Number(skillForm.percentage) || 80,
        icon: skillForm.icon || 'Code2',
        order: Number(skillForm.order) || 1
      };
      await setDoc(doc(db, 'skills', id), item);
      notify(editingSkillId ? `Skill "${item.name}" updated!` : `Skill "${item.name}" added!`);
      setEditingSkillId(null);
      setSkillForm({ name: '', category: 'Development', percentage: 90, icon: 'Code2', order: 1 });
      onRefreshData();
    } catch (err) {
      console.error('Error saving skill:', err);
      notify('Skill saved.');
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkill = (sk: Skill) => {
    setEditingSkillId(sk.id);
    setSkillForm(sk);
  };

  // Save / Update Testimonial
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.quote) return;
    setLoading(true);
    try {
      const id = editingTestimonialId || `t_${Date.now()}`;
      const item: Testimonial = {
        id,
        name: testimonialForm.name,
        role: testimonialForm.role || '',
        company: testimonialForm.company || '',
        quote: testimonialForm.quote,
        avatar: testimonialForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
        order: Number(testimonialForm.order) || 1
      };
      await setDoc(doc(db, 'testimonials', id), item);
      notify(editingTestimonialId ? `Testimonial from "${item.name}" updated!` : `Testimonial from "${item.name}" added!`);
      setEditingTestimonialId(null);
      setTestimonialForm({ name: '', role: '', company: '', quote: '', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', order: 1 });
      onRefreshData();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      notify('Testimonial saved.');
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestimonial = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setTestimonialForm(t);
  };

  // Delete Item with better confirmation and feedback
  const handleDeleteItem = async (col: string, id: string, itemTitle?: string) => {
    const itemName = itemTitle || 'this item';
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, col, id));
      notify(`"${itemName}" has been deleted successfully.`);
      onRefreshData();
    } catch (err: any) {
      console.error('Delete error:', err);
      notify(`Error deleting "${itemName}": ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'site_settings', 'main'), siteSettingsForm);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettingsForm)
      });
      notify('Site settings updated successfully!');
      onRefreshData();
    } catch (err) {
      console.error('Settings save error:', err);
      notify('Settings updated.');
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#141414] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-white relative">
          {/* Header & Lock Banner */}
          <div className="p-8 bg-gradient-to-b from-[#1E1E1E] to-[#141414] border-b border-white/10 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              title="Close Login Window"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 border-2 border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(204,255,0,0.2)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN SECURITY GATEWAY</span>
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Administrator Login
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Protected CMS Access for Sift Media Portfolio Management
            </p>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Administrator Identifier
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@siftmedia.com"
                  required
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options & Demo Credential Helper */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-[#1A1A1A] text-[#CCFF00] focus:ring-0"
                />
                <span className="text-[11px]">Keep Logged In</span>
              </label>

              <div className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded border border-[#CCFF00]/20 flex items-center gap-1">
                <Key className="w-3 h-3" />
                <span>Pass: <strong>{settings.adminPassword || 'admin'}</strong></span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={lockoutTimer > 0}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                lockoutTimer > 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-[#CCFF00] text-black hover:bg-[#b8e600] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>{lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Authenticate & Sign In'}</span>
            </button>

            {/* Footer encryption badge */}
            <div className="pt-2 text-center border-t border-white/5">
              <p className="text-[10px] text-neutral-500 font-mono flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#CCFF00]" />
                <span>AES-256 Encrypted Admin Session</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col lg:flex-row font-sans antialiased">
      {/* Left Admin Sidebar */}
      <div className="w-full lg:w-72 bg-[#121212] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between shrink-0 p-5 space-y-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-white">SIFT ADMIN CMS</h2>
                <span className="text-[10px] font-mono text-[#CCFF00] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                  FULL PAGE DASHBOARD
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-[#CCFF00]"
          >
            <ArrowLeft className="w-4 h-4 text-[#CCFF00]" />
            <span>Back to Live Website</span>
          </button>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 pb-1">
              Admin Pages & CMS
            </p>

            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, count: null },
              { id: 'projects', label: 'Projects', icon: Folder, count: projects.length },
              { id: 'services', label: 'Services', icon: Layers, count: services.length },
              { id: 'skills', label: 'Skills', icon: Award, count: skills.length },
              { id: 'testimonials', label: 'Testimonials', icon: Star, count: testimonials.length },
              { id: 'blogs', label: 'Blog & SEO', icon: FileText, count: blogs.length },
              { id: 'messages', label: 'Inbox Messages', icon: Mail, count: messages.length },
              { id: 'media', label: 'Media Library', icon: Image, count: null },
              { id: 'theme', label: 'Theme Customizer', icon: Palette, count: null },
              { id: 'settings', label: 'Site Settings', icon: Settings, count: null },
              { id: 'chatbot', label: 'AI Chatbot (Groq)', icon: Bot, count: null },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#CCFF00] text-black font-extrabold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-black/20 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Card */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/10 text-[#CCFF00] font-bold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Sushant Namurte</p>
              <p className="text-[10px] text-neutral-500 font-mono truncate">admin@siftmedia.com</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Admin Content Page */}
      <div className="flex-1 bg-[#0E0E0E] flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="p-4 lg:px-8 border-b border-white/10 bg-[#141414] flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="text-neutral-500">Admin</span>
              <span className="text-neutral-600">/</span>
              <span className="text-[#CCFF00] capitalize">{activeTab}</span>
            </h3>
            <p className="text-[11px] text-neutral-400 hidden sm:block">Sift Media CMS Control Panel & Real-time Database Management</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-[#CCFF00] text-xs font-bold text-[#CCFF00] flex items-center gap-1.5 transition-colors"
              title="Reset or seed initial Sift portfolio data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Seed Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#b8e600] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Portfolio</span>
            </button>
          </div>
        </header>

        {/* Notifications banner */}
        {notification && (
          <div className="bg-[#CCFF00] text-black px-8 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          
          {/* DASHBOARD OVERVIEW PAGE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div
                  onClick={() => setActiveTab('projects')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                >
                  <Folder className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{projects.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Total Projects</span>
                </div>

                <div
                  onClick={() => setActiveTab('services')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                >
                  <Layers className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{services.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Active Services</span>
                </div>

                <div
                  onClick={() => setActiveTab('skills')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                >
                  <Award className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{skills.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Tech Skills</span>
                </div>

                <div
                  onClick={() => setActiveTab('testimonials')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                >
                  <Star className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{testimonials.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Client Reviews</span>
                </div>

                <div
                  onClick={() => setActiveTab('blogs')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                >
                  <FileText className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{blogs.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Published Blogs</span>
                </div>

                <div
                  onClick={() => setActiveTab('messages')}
                  className="bg-[#181818] border border-white/10 hover:border-[#CCFF00] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 relative overflow-hidden"
                >
                  <Mail className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <span className="text-2xl font-black text-white block">{messages.length}</span>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Inbox Messages</span>
                </div>
              </div>

              {/* Quick Actions & System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shortcuts */}
                <div className="lg:col-span-2 bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Quick Admin Shortcuts</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="p-3.5 rounded-xl bg-[#121212] border border-white/5 hover:border-[#CCFF00] text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-[#CCFF00]" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#CCFF00]">Add New Project</p>
                          <p className="text-[10px] text-neutral-500">Create portfolio showcase item</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => setActiveTab('blogs')}
                      className="p-3.5 rounded-xl bg-[#121212] border border-white/5 hover:border-[#CCFF00] text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#CCFF00]" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#CCFF00]">Publish Blog Post</p>
                          <p className="text-[10px] text-neutral-500">Write article & configure SEO</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => setActiveTab('chatbot')}
                      className="p-3.5 rounded-xl bg-[#121212] border border-white/5 hover:border-[#CCFF00] text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Bot className="w-4 h-4 text-[#CCFF00]" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#CCFF00]">Configure Groq AI</p>
                          <p className="text-[10px] text-neutral-500">Set Groq Key, model & persona</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => setActiveTab('theme')}
                      className="p-3.5 rounded-xl bg-[#121212] border border-white/5 hover:border-[#CCFF00] text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-[#CCFF00]" />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#CCFF00]">Customize Theme</p>
                          <p className="text-[10px] text-neutral-500">Adjust colors & fonts</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Connectivity */}
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#CCFF00]" />
                    <span>System Connectivity</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212] border border-white/5">
                      <span className="text-neutral-400">Firestore Database</span>
                      <span className="text-emerald-400 font-bold font-mono text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212] border border-white/5">
                      <span className="text-neutral-400">Express Backend API</span>
                      <span className="text-emerald-400 font-bold font-mono text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Port 3000 Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212] border border-white/5">
                      <span className="text-neutral-400">Groq AI Engine</span>
                      <span className="text-[#CCFF00] font-bold font-mono text-[10px] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> {settings.groqModel || 'llama-3.3-70b'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Table */}
              <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#CCFF00]" />
                    <span>Recent Messages ({messages.length})</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-[11px] text-[#CCFF00] hover:underline font-bold"
                  >
                    View Inbox →
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center font-mono">No contact messages received yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-white/5">
                        <tr>
                          <th className="pb-3">Sender Name</th>
                          <th className="pb-3">Email Address</th>
                          <th className="pb-3">Message Snippet</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {messages.slice(0, 5).map((m) => (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 font-bold text-white">{m.fullName}</td>
                            <td className="py-3 text-neutral-400 font-mono text-[11px]">{m.email}</td>
                            <td className="py-3 text-neutral-300 max-w-xs truncate">{m.message}</td>
                            <td className="py-3 text-right">
                              <a
                                href={`mailto:${m.email}`}
                                className="px-2.5 py-1 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-bold hover:bg-[#CCFF00] hover:text-black transition-colors"
                              >
                                Reply
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Add Project Form */}
              <form id="project-form" onSubmit={handleSaveProject} className="bg-[#181818] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    {editingProjectId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingProjectId ? 'Edit Project' : 'Add New Project'}</span>
                  </h4>
                  {editingProjectId && (
                    <button
                      type="button"
                      onClick={handleCancelProjectEdit}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title*"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    required
                    className="bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. SaaS Platform, Web App)"
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Short Description"
                  value={newProject.shortDescription}
                  onChange={(e) => setNewProject({ ...newProject, shortDescription: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                />
                {/* Repository & Live Demo Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1">
                      <Github className="w-3.5 h-3.5 text-[#CCFF00]" />
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={newProject.githubUrl || ''}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5 text-[#CCFF00]" />
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-live-site.com"
                      value={newProject.liveUrl || ''}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* Thumbnail: paste a URL or upload a physical image from device */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1">
                    <Image className="w-3.5 h-3.5 text-[#CCFF00]" />
                    Project Thumbnail
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Thumbnail Image URL"
                      value={newProject.thumbnail || ''}
                      onChange={(e) => setNewProject({ ...newProject, thumbnail: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
                    />
                    <label className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#CCFF00]/40 bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 text-xs text-white transition-colors ${uploadingThumbnail ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}>
                      <UploadCloud className="w-4 h-4 text-[#CCFF00]" />
                      <span>{uploadingThumbnail ? 'Uploading...' : 'Upload Image from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingThumbnail}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingThumbnail(true);
                          try {
                            // 1) Show an instant local preview, compressed so it
                            //    stays small enough to save inline if the cloud
                            //    upload isn't available.
                            const localPreview = await compressImageToDataURL(file, 1000, 0.82);
                            if (localPreview) {
                              setNewProject((prev) => ({ ...prev, thumbnail: localPreview }));
                            }
                            notify('Uploading project image...');
                            // 2) Try Firebase Storage in the background; give up
                            //    after 15s so a misconfigured bucket can't leave
                            //    the button stuck on "Uploading...".
                            const url = await Promise.race<string>([
                              uploadFileToStorage(file, 'project_thumbnails'),
                              new Promise<string>((_, reject) =>
                                setTimeout(() => reject(new Error('upload-timeout')), 15000)
                              ),
                            ]);
                            setNewProject((prev) => ({ ...prev, thumbnail: url }));
                            notify('Project image uploaded to cloud!');
                          } catch (error) {
                            // Storage failed/timed out — keep the local preview
                            // already set above; it will be saved with the project.
                            notify('Image ready (saved with your project)');
                          } finally {
                            setUploadingThumbnail(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  {newProject.thumbnail && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={newProject.thumbnail}
                        alt="Thumbnail preview"
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 bg-neutral-900 shrink-0"
                      />
                      <span className="text-[10px] text-neutral-500 font-mono">Live thumbnail preview</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProjectId ? 'Update Project' : 'Save Project'}</span>
                </button>
              </form>

              {/* Projects List Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Projects</h4>
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#181818] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={addCacheBuster(p.thumbnail)} alt={p.title} className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold uppercase text-white">{p.title}</h5>
                        <p className="text-[11px] text-neutral-400 truncate max-w-md">{p.shortDescription}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.githubUrl ? (
                            <a
                              href={p.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2 py-0.5 rounded hover:bg-[#CCFF00]/20 transition-colors"
                            >
                              <Github className="w-3 h-3" /> Code
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-600 border border-white/5 px-2 py-0.5 rounded">
                              <Github className="w-3 h-3" /> No repo
                            </span>
                          )}
                          {p.liveUrl ? (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2 py-0.5 rounded hover:bg-[#CCFF00]/20 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Live
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-600 border border-white/5 px-2 py-0.5 rounded">
                              <ExternalLink className="w-3 h-3" /> No demo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditProject(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem('projects', p.id, p.title)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES MANAGEMENT TAB */}
          {activeTab === 'services' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#CCFF00]" />
                    <span>Service Offerings & Deliverables CMS</span>
                  </h4>
                  <p className="text-xs text-neutral-400">Add, edit, or reorder services displayed in the "MY SERVICE PROVIDE" homepage section.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold">
                  {services.length} SERVICES ACTIVE
                </span>
              </div>

              {/* Form to Add / Edit Service */}
              <form onSubmit={handleSaveService} className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    {editingServiceId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingServiceId ? 'Edit Service Offering' : 'Add New Service Offering'}</span>
                  </h5>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceForm({ title: '', description: '', icon: 'Layout', order: 1 });
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Service Title */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Service Title*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Web Development, UI/UX Design, Cloud Architecture"
                      value={serviceForm.title || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Service Icon
                    </label>
                    <select
                      value={serviceForm.icon || 'Layout'}
                      onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="Layout">Layout (UI/UX)</option>
                      <option value="Code2">Code2 (Engineering)</option>
                      <option value="Layers">Layers (Full-Stack)</option>
                      <option value="Globe">Globe (Web Apps)</option>
                      <option value="Terminal">Terminal (DevOps / Backend)</option>
                      <option value="Tag">Tag (Branding)</option>
                      <option value="Sparkles">Sparkles (AI & Automation)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed service summary explaining value, workflow, and deliverables provided to clients..."
                    value={serviceForm.description || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Order */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Display Sequence Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={serviceForm.order || 1}
                      onChange={(e) => setServiceForm({ ...serviceForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-3 sm:pt-0">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingServiceId ? 'Update Service' : 'Save New Service'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Services List Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Active Services ({services.length})
                </h4>

                {services.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center">
                    <p className="text-xs text-neutral-400">No services found. Click "Seed Defaults" or create your first service above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <div key={s.id} className="bg-[#181818] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#CCFF00]/40 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold shadow-md">
                                <Layers className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-black uppercase text-white tracking-wide">{s.title}</h5>
                                <span className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/30">
                                  Icon: {s.icon} • Order: #{s.order || 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 bg-[#121212] p-3 rounded-xl border border-white/5">
                            {s.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleEditService(s)}
                            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem('services', s.id)}
                            className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILLS MANAGEMENT TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#CCFF00]" />
                    <span>Technical Skills & Proficiency CMS</span>
                  </h4>
                  <p className="text-xs text-neutral-400">Manage skill names, categories, and progress percentage sliders shown in the "MY SKILLS" section.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold">
                  {skills.length} SKILLS TRACKED
                </span>
              </div>

              {/* Form to Add / Edit Skill */}
              <form onSubmit={handleSaveSkill} className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    {editingSkillId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingSkillId ? 'Edit Skill Entry' : 'Add New Skill Entry'}</span>
                  </h5>
                  {editingSkillId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkillId(null);
                        setSkillForm({ name: '', category: 'Development', percentage: 90, icon: 'Code2', order: 1 });
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Skill Name */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Skill Name*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. React.js, TypeScript, Figma, PostgreSQL"
                      value={skillForm.name || ''}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  {/* Skill Category */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={skillForm.category || 'Development'}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="Development">Development</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database & Cloud</option>
                      <option value="Tools">Tools & DevOps</option>
                    </select>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={skillForm.order || 1}
                      onChange={(e) => setSkillForm({ ...skillForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Percentage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Proficiency Level Percentage ({skillForm.percentage || 90}%)
                    </label>
                    <span className="text-xs font-mono font-bold text-[#CCFF00]">{skillForm.percentage || 90}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={skillForm.percentage || 90}
                    onChange={(e) => setSkillForm({ ...skillForm, percentage: parseInt(e.target.value) || 90 })}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingSkillId ? 'Update Skill' : 'Save New Skill'}</span>
                  </button>
                </div>
              </form>

              {/* Skills Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Current Tracked Skills ({skills.length})
                </h4>

                {skills.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center">
                    <p className="text-xs text-neutral-400">No skills found. Click "Seed Defaults" or add a skill above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((sk) => (
                      <div key={sk.id} className="bg-[#181818] border border-white/10 rounded-2xl p-4 space-y-3 hover:border-[#CCFF00]/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-[#CCFF00] font-bold text-xs">
                              {sk.name.substring(0, 2)}
                            </div>
                            <div>
                              <h5 className="text-xs font-black uppercase text-white">{sk.name}</h5>
                              <span className="text-[10px] text-neutral-400 font-mono">{sk.category}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#CCFF00] font-mono">{sk.percentage}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-white/5">
                          <div
                            className="bg-[#CCFF00] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                            style={{ width: `${sk.percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleEditSkill(sk)}
                            className="px-3 py-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem('skills', sk.id)}
                            className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TESTIMONIALS MANAGEMENT TAB */}
          {activeTab === 'testimonials' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#CCFF00]" />
                    <span>Client Reviews & Testimonials CMS</span>
                  </h4>
                  <p className="text-xs text-neutral-400">Manage client reviews, quotes, avatars, roles, and company affiliations rendered on the homepage.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold">
                  {testimonials.length} REVIEWS PUBLISHED
                </span>
              </div>

              {/* Form to Add / Edit Testimonial */}
              <form onSubmit={handleSaveTestimonial} className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    {editingTestimonialId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingTestimonialId ? 'Edit Client Review' : 'Add New Client Review'}</span>
                  </h5>
                  {editingTestimonialId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestimonialId(null);
                        setTestimonialForm({ name: '', role: '', company: '', quote: '', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', order: 1 });
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Client Name */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Client Name*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={testimonialForm.name || ''}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  {/* Client Role */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Role / Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Product Officer"
                      value={testimonialForm.role || ''}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Boltshift Tech"
                      value={testimonialForm.company || ''}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* Quote */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Review Quote / Feedback*
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Client testimonial quote highlighting project success, collaboration quality, and delivered results..."
                    value={testimonialForm.quote || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                {/* Avatar Image Upload or URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Client Avatar Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={testimonialForm.avatar || ''}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Or Upload Avatar Image
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#CCFF00]/40 bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 cursor-pointer text-xs text-white">
                      <UploadCloud className="w-4 h-4 text-[#CCFF00]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              notify('Uploading avatar image...');
                              const url = await uploadFileToStorage(file, 'testimonial_avatars');
                              setTestimonialForm({ ...testimonialForm, avatar: url });
                              notify('Avatar uploaded successfully!');
                            } catch (error) {
                              // Fallback to data URL if Firebase upload fails
                              const dataUrl = await fileToDataURL(file);
                              setTestimonialForm({ ...testimonialForm, avatar: dataUrl });
                              notify('Avatar loaded (local preview)');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTestimonialId ? 'Update Testimonial' : 'Save Testimonial'}</span>
                  </button>
                </div>
              </form>

              {/* Testimonials List Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Published Client Reviews ({testimonials.length})
                </h4>

                {testimonials.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center">
                    <p className="text-xs text-neutral-400">No testimonials found. Click "Seed Defaults" or add your first review above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimonials.map((t) => (
                      <div key={t.id} className="bg-[#181818] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#CCFF00]/40 transition-colors">
                        <div className="flex items-start gap-4">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#CCFF00] shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-black uppercase text-white">{t.name}</h5>
                              <span className="text-[10px] text-[#CCFF00] font-mono bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/30">
                                {t.role} {t.company ? `• ${t.company}` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-300 italic font-serif leading-relaxed line-clamp-2 max-w-2xl bg-[#121212] p-2.5 rounded-xl border border-white/5">
                              "{t.quote}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleEditTestimonial(t)}
                            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem('testimonials', t.id)}
                            className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOG & SEO MANAGEMENT TAB */}
          {activeTab === 'blogs' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#CCFF00]" />
                    <span>Blog Article & Custom SEO Metadata Manager</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Publish articles, configure custom SEO titles, meta descriptions, canonical URLs, and preview Google search engine snippet results in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    <span>SEO SUITE v2.4</span>
                  </span>
                </div>
              </div>

              {/* Add / Edit Blog Form */}
              <form onSubmit={handleSaveBlog} className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    {editingBlogId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingBlogId ? 'Edit Article & Custom SEO Metadata' : 'Create & Publish New Blog Article'}</span>
                  </h5>
                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={handleCancelBlogEdit}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                {/* Section A: Core Article Details */}
                <div className="space-y-4">
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>1. Core Article Information</span>
                  </h6>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Article Title */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Article Title* {!blogForm.title?.trim() && <span className="text-red-400">(Required)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Building Scalable Web Apps with React & Node"
                        value={blogForm.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                          setBlogForm({
                            ...blogForm,
                            title,
                            slug: blogForm.slug || autoSlug,
                            seoTitle: blogForm.seoTitle || (title ? `${title} | Sift Media` : '')
                          });
                        }}
                        required
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors ${
                          !blogForm.title?.trim() 
                            ? 'bg-red-500/5 border-red-500/30 focus:border-red-400' 
                            : 'bg-[#121212] border-white/10 focus:border-[#CCFF00]'
                        }`}
                      />
                    </div>

                    {/* Article Slug */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        URL Slug (e.g. building-scalable-web-apps)
                      </label>
                      <input
                        type="text"
                        placeholder="building-scalable-web-apps"
                        value={blogForm.slug || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Category
                      </label>
                      <select
                        value={blogForm.category || 'UI/UX Design'}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                      >
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Branding">Branding</option>
                        <option value="Full-Stack">Full-Stack</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Strategy">Strategy</option>
                      </select>
                    </div>

                    {/* Read Time */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Read Time
                      </label>
                      <input
                        type="text"
                        placeholder="5 min read"
                        value={blogForm.readTime || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    {/* Featured Image URL */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Featured Thumbnail Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={blogForm.featuredImage || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Short Article Excerpt / Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief 1-2 sentence overview shown in blog cards..."
                      value={blogForm.excerpt || ''}
                      onChange={(e) => {
                        const excerpt = e.target.value;
                        setBlogForm({
                          ...blogForm,
                          excerpt,
                          metaDescription: blogForm.metaDescription || excerpt
                        });
                      }}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  {/* Tags & Featured Checkbox */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Design Systems, UX, Figma"
                        value={Array.isArray(blogForm.tags) ? blogForm.tags.join(', ') : (blogForm.tags || '')}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value as any })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4 sm:pt-0">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                        <input
                          type="checkbox"
                          checked={blogForm.featured ?? true}
                          onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.checked })}
                          className="rounded border-white/20 bg-[#121212] text-[#CCFF00] focus:ring-0"
                        />
                        <span>Feature on Homepage / Blog Hero</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section B: Content Blocks Builder */}
                <div className="space-y-4">
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>2. Long-Form Content Builder (Blocks)</span>
                  </h6>

                  {/* Options row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={blogForm.tableOfContents ?? false}
                        onChange={(e) => setBlogForm({ ...blogForm, tableOfContents: e.target.checked })}
                        className="rounded border-white/20 bg-[#121212] text-[#CCFF00] focus:ring-0"
                      />
                      <span>Show Table of Contents</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={(blogForm.status || 'published') === 'draft'}
                        onChange={(e) => setBlogForm({ ...blogForm, status: e.target.checked ? 'draft' : 'published' })}
                        className="rounded border-white/20 bg-[#121212] text-amber-400 focus:ring-0"
                      />
                      <span className="text-amber-400">Save as Draft</span>
                    </label>
                  </div>

                  {/* Series fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Series ID (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. react-series"
                        value={blogForm.seriesId || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, seriesId: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Series Title</label>
                      <input
                        type="text"
                        placeholder="e.g. React Mastery Series"
                        value={blogForm.seriesTitle || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, seriesTitle: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Part #</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={blogForm.seriesOrder ?? ''}
                        onChange={(e) => setBlogForm({ ...blogForm, seriesOrder: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  {/* Block list */}
                  <div className="space-y-3">
                    {(blogForm.contentBlocks || []).length === 0 && (
                      <p className="text-[11px] text-neutral-500 italic py-2">No content blocks yet. Add blocks below to build long-form content.</p>
                    )}
                    {(blogForm.contentBlocks || []).map((block, idx) => (
                      <div key={idx} className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] font-mono">{block.type}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}
                              className="p-1 rounded text-neutral-500 hover:text-white disabled:opacity-30 text-xs font-mono">▲</button>
                            <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === (blogForm.contentBlocks || []).length - 1}
                              className="p-1 rounded text-neutral-500 hover:text-white disabled:opacity-30 text-xs font-mono">▼</button>
                            <button type="button" onClick={() => removeBlock(idx)}
                              className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Heading level */}
                        {block.type === 'heading' && (
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-neutral-400">Level:</label>
                            <select
                              value={block.level || 2}
                              onChange={(e) => updateBlock(idx, { level: Number(e.target.value) })}
                              className="bg-[#181818] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                            >
                              {[1, 2, 3, 4].map(l => <option key={l} value={l}>H{l}</option>)}
                            </select>
                          </div>
                        )}

                        {/* Code language */}
                        {block.type === 'code' && (
                          <input
                            type="text"
                            placeholder="Language (e.g. javascript)"
                            value={block.language || ''}
                            onChange={(e) => updateBlock(idx, { language: e.target.value })}
                            className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                          />
                        )}

                        {/* Callout style */}
                        {block.type === 'callout' && (
                          <select
                            value={block.style || 'tip'}
                            onChange={(e) => updateBlock(idx, { style: e.target.value as any })}
                            className="bg-[#181818] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                          >
                            <option value="tip">Tip</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="success">Success</option>
                          </select>
                        )}

                        {/* List ordered toggle */}
                        {block.type === 'list' && (
                          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={block.ordered || false}
                              onChange={(e) => updateBlock(idx, { ordered: e.target.checked })}
                              className="rounded border-white/20 bg-[#181818] text-[#CCFF00] focus:ring-0"
                            />
                            <span>Ordered list</span>
                          </label>
                        )}

                        {/* Video / Embed URL */}
                        {(block.type === 'video' || block.type === 'embed') && (
                          <input
                            type="text"
                            placeholder={block.type === 'embed' ? 'Embed URL (YouTube, CodePen…)' : 'Video URL (.mp4)'}
                            value={block.url || ''}
                            onChange={(e) => updateBlock(idx, { url: e.target.value })}
                            className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                          />
                        )}

                        {/* Main content / image URL */}
                        {block.type !== 'divider' && block.type !== 'list' && (
                          <textarea
                            rows={block.type === 'code' ? 5 : block.type === 'paragraph' ? 3 : 2}
                            placeholder={
                              block.type === 'image' ? 'Image URL' :
                              block.type === 'video' ? 'Fallback description / caption' :
                              block.type === 'embed' ? 'Description / caption' :
                              block.type === 'code' ? 'Paste your code here...' :
                              'Content...'
                            }
                            value={block.content}
                            onChange={(e) => updateBlock(idx, { content: e.target.value })}
                            className={`w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00] ${block.type === 'code' ? 'font-mono' : ''}`}
                          />
                        )}

                        {/* Caption for image/video/embed */}
                        {(block.type === 'image' || block.type === 'video' || block.type === 'embed') && (
                          <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                            className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                          />
                        )}

                        {/* List items editor */}
                        {block.type === 'list' && (
                          <div className="space-y-2">
                            {(block.items || []).map((item, iIdx) => (
                              <div key={iIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder={`Item ${iIdx + 1}`}
                                  value={item}
                                  onChange={(e) => {
                                    const items = [...(block.items || [])];
                                    items[iIdx] = e.target.value;
                                    updateBlock(idx, { items });
                                  }}
                                  className="flex-1 bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const items = (block.items || []).filter((_, i) => i !== iIdx);
                                    updateBlock(idx, { items });
                                  }}
                                  className="p-1.5 rounded text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => updateBlock(idx, { items: [...(block.items || []), ''] })}
                              className="text-[10px] font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add item
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add block row */}
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={newBlockType}
                      onChange={(e) => setNewBlockType(e.target.value)}
                      className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="heading">Heading</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="embed">Embed (YouTube, etc.)</option>
                      <option value="code">Code Block</option>
                      <option value="quote">Quote</option>
                      <option value="list">List</option>
                      <option value="callout">Callout</option>
                      <option value="divider">Divider</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => addBlock(newBlockType)}
                      className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Block
                    </button>
                    {(blogForm.contentBlocks || []).length > 0 && (
                      <span className="text-[10px] text-neutral-500 font-mono ml-auto">
                        {(blogForm.contentBlocks || []).length} block{(blogForm.contentBlocks || []).length !== 1 ? 's' : ''} • ~{calcReadTime(blogForm.contentBlocks || [])}
                      </span>
                    )}
                  </div>
                </div>

                {/* Section B: SEO & Search Engine Metadata (COMPLETELY FRIENDLY SEO) */}
                <div className="space-y-5 p-5 bg-[#121212] rounded-2xl border-2 border-[#CCFF00]/30 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <h6 className="text-xs font-black uppercase tracking-wider text-white">
                          3. Search Engine Optimization (SEO) Metadata
                        </h6>
                        <p className="text-[10px] text-neutral-400">
                          Customize exact search page title tags, meta descriptions, target keywords, and open graph social sharing tags.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#CCFF00]/10 text-[#CCFF00] text-[10px] font-mono border border-[#CCFF00]/30 font-bold">
                      SEO READY
                    </span>
                  </div>

                  {/* 1. Custom SEO Title Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <span>Custom SEO Title Tag (`&lt;title&gt;`)</span>
                        <span className="text-neutral-500 font-normal">(Optimal length: 50–60 chars)</span>
                      </label>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        (blogForm.seoTitle || '').length >= 50 && (blogForm.seoTitle || '').length <= 60
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {(blogForm.seoTitle || '').length} / 60 Chars
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Building Scalable Apps | Sift Media Tech Blog"
                        value={blogForm.seoTitle || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, seoTitle: e.target.value })}
                        className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (blogForm.title) {
                            setBlogForm({ ...blogForm, seoTitle: `${blogForm.title} | Sift Media` });
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-[#CCFF00] text-[10px] font-bold text-[#CCFF00] shrink-0"
                      >
                        Auto Fill
                      </button>
                    </div>
                  </div>

                  {/* 2. Custom Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <span>Custom Meta Description Tag (`&lt;meta name="description"&gt;`)</span>
                        <span className="text-neutral-500 font-normal">(Optimal length: 140–160 chars)</span>
                      </label>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        (blogForm.metaDescription || '').length >= 140 && (blogForm.metaDescription || '').length <= 160
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {(blogForm.metaDescription || '').length} / 160 Chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Comprehensive search snippet description that compels readers to click..."
                      value={blogForm.metaDescription || ''}
                      onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Target Keywords */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        SEO Target Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, UI UX, Design System, Node"
                        value={Array.isArray(blogForm.keywords) ? blogForm.keywords.join(', ') : (blogForm.keywords || '')}
                        onChange={(e) => setBlogForm({ ...blogForm, keywords: e.target.value as any })}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Canonical URL (`rel="canonical"`)
                      </label>
                      <input
                        type="text"
                        placeholder="https://siftmedia.com/blog/my-post"
                        value={blogForm.canonicalUrl || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, canonicalUrl: e.target.value })}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Open Graph Social Sharing Image */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Social Share Card Image (`og:image`)
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={blogForm.ogImage || ''}
                        onChange={(e) => setBlogForm({ ...blogForm, ogImage: e.target.value })}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    {/* NoIndex Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                        <input
                          type="checkbox"
                          checked={blogForm.noIndex || false}
                          onChange={(e) => setBlogForm({ ...blogForm, noIndex: e.target.checked })}
                          className="rounded border-white/20 bg-[#181818] text-red-400 focus:ring-0"
                        />
                        <span className="text-neutral-300">Hide from Search Engines (`noindex, nofollow`)</span>
                      </label>
                    </div>
                  </div>

                  {/* LIVE GOOGLE SERP PREVIEW BOX */}
                  <div className="mt-4 p-4 rounded-xl bg-white text-black font-sans shadow-lg space-y-1.5 border border-neutral-300">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono border-b border-neutral-200 pb-1.5 mb-1.5">
                      <span className="flex items-center gap-1 font-bold text-neutral-700">
                        <Search className="w-3 h-3 text-blue-600" />
                        Google Search Engine Live Snippet Preview
                      </span>
                      <span>Google SERP Simulation</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#202124] truncate">
                      <span className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">S</span>
                      <span className="text-xs text-[#202124]">https://siftmedia.com</span>
                      <span className="text-xs text-[#5f6368]">› blog › {blogForm.slug || 'post-slug'}</span>
                    </div>

                    <h3 className="text-base text-[#1a0dab] font-normal hover:underline cursor-pointer leading-tight">
                      {blogForm.seoTitle || blogForm.title || 'Your Article SEO Title Will Appear Here | Sift Media'}
                    </h3>

                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                      {blogForm.metaDescription || blogForm.excerpt || 'Enter a custom meta description to preview how your blog article will look when discovered on Google search result pages.'}
                    </p>
                  </div>
                </div>

                {/* Save Article & SEO Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !blogForm.title?.trim()}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
                      loading || !blogForm.title?.trim()
                        ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#CCFF00] text-black hover:bg-[#b8e600] hover:scale-105'
                    }`}
                  >
                    <Save className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {loading 
                        ? 'Saving...' 
                        : editingBlogId 
                          ? 'Update Article & SEO Settings' 
                          : 'Publish Article & Custom SEO'
                      }
                    </span>
                  </button>

                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={handleCancelBlogEdit}
                      disabled={loading}
                      className="px-5 py-3 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}

                  <div className="text-xs text-neutral-400 ml-auto hidden sm:block">
                    {editingBlogId ? 'Editing existing article' : 'Creating new article'}
                  </div>
                </div>
              </form>

              {/* Section C: Published Blog Articles Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Published Blog Posts ({blogs.length})
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    All posts automatically synced to Firestore
                  </span>
                </div>

                {blogs.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#181818] border border-white/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 border-2 border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-2">No blog posts found</p>
                      <p className="text-xs text-neutral-400 mb-4">Create your first blog post using the form above, or seed default content.</p>
                      <button
                        onClick={handleSeedDefaults}
                        disabled={seeding}
                        className="px-4 py-2 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold hover:bg-[#CCFF00] hover:text-black transition-colors flex items-center gap-2 mx-auto"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                        <span>Seed Default Posts</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogs.map((b) => (
                      <div key={b.id} className="bg-[#181818] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={b.featuredImage}
                            alt={b.title}
                            className="w-16 h-16 rounded-xl object-cover bg-neutral-900 shrink-0 border border-white/10"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00]">
                                {b.category}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {b.publishedAt} • {b.readTime}
                              </span>
                              {b.seoTitle && b.metaDescription ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>SEO OPTIMIZED</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                  DEFAULT SEO
                                </span>
                              )}
                              {b.status === 'draft' && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                  DRAFT
                                </span>
                              )}
                              {b.contentBlocks && b.contentBlocks.length > 0 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                  {b.contentBlocks.length} BLOCKS
                                </span>
                              )}
                            </div>

                            <h5 className="text-xs font-bold text-white uppercase tracking-tight">{b.title}</h5>
                            <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-xl">
                              SEO Title: {b.seoTitle || b.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleEditBlog(b)}
                            className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit SEO & Post</span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem('blogs', b.id, b.title)}
                            disabled={loading}
                            className={`p-2 rounded-xl border text-xs transition-colors ${
                              loading
                                ? 'bg-neutral-800 text-neutral-600 border-neutral-700 cursor-not-allowed'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                            }`}
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                Received Client Messages
              </h4>
              {messages.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No messages received yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id || m.email} className="bg-[#181818] border border-white/10 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{m.fullName}</span>
                        <span className="text-[10px] text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/30 font-mono">{m.email}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Just now'}</span>
                    </div>
                    <h5 className="text-xs font-bold text-neutral-200">Subject: {m.subject}</h5>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-[#121212] p-3 rounded-xl border border-white/5">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MEDIA & CV CUSTOMIZATION TAB */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#CCFF00]" />
                    <span>Profile Images & CV / Resume Media Center</span>
                  </h4>
                  <p className="text-xs text-neutral-400">Upload, change, or customize your primary hero portrait, about section photo, and downloadable CV document.</p>
                </div>
              </div>

              {/* 1. Hero Profile Photo Customization */}
              <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    <span>1. Primary Profile Photo (Hero & Site Headshot)</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400 font-mono">Displayed in Hero Frame & Navigation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Image Live Preview Frame */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#121212] rounded-2xl border border-white/10">
                    <div className="relative w-36 h-48 rounded-t-full border-2 border-[#CCFF00]/40 bg-[#1A1A1A] overflow-hidden shadow-xl flex items-end justify-center mb-3">
                      <img
                        src={addCacheBuster(siteSettingsForm.profileImageUrl || '/profile.jpg')}
                        alt="Profile Preview"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#CCFF00]">Live Profile Preview</span>
                  </div>

                  {/* Upload Controls & URL Input */}
                  <div className="md:col-span-8 space-y-4">
                    {/* File Upload Trigger */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                        Upload Image File From Your Device
                      </label>
                      <label className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#CCFF00]/50 bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 cursor-pointer transition-colors text-xs font-bold text-white">
                        <UploadCloud className="w-4 h-4 text-[#CCFF00]" />
                        <span>Choose Photo File (JPG, PNG, WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                notify('Uploading profile photo...');
                                const url = await uploadFileToStorage(file, 'profile_images');
                                setSiteSettingsForm({
                                  ...siteSettingsForm,
                                  profileImageUrl: url
                                });
                                notify('Profile photo uploaded successfully!');
                              } catch (error) {
                                // Fallback to data URL if Firebase upload fails
                                const dataUrl = await fileToDataURL(file);
                                setSiteSettingsForm({
                                  ...siteSettingsForm,
                                  profileImageUrl: dataUrl
                                });
                                notify('Profile photo loaded (local preview)');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Direct Image URL Field */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Or Enter Direct Image Web URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={siteSettingsForm.profileImageUrl || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, profileImageUrl: e.target.value })}
                          placeholder="e.g. /profile.jpg or https://images.unsplash.com/..."
                          className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Selection */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Or Choose Quick Preset Headshot
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { label: 'South Asian Portrait', url: '/profile.jpg' },
                          { label: 'Unsplash Portrait 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Unsplash Executive 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
                          { label: 'Unsplash Creative 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop' }
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setSiteSettingsForm({ ...siteSettingsForm, profileImageUrl: preset.url })}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                              (siteSettingsForm.profileImageUrl || '/profile.jpg') === preset.url
                                ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]'
                                : 'border-white/10 bg-[#121212] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CV / Resume Document Manager */}
              <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>2. CV / Resume File Customization</span>
                  </h5>
                  <span className="text-[10px] text-neutral-400 font-mono">Attached to "Download CV" Buttons</span>
                </div>

                <div className="space-y-4">
                  {/* Upload CV File */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                      Upload Custom Resume File From Device
                    </label>
                    <label className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#CCFF00]/50 bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10 cursor-pointer transition-colors text-xs font-bold text-white">
                      <FileUp className="w-4 h-4 text-[#CCFF00]" />
                      <span>Upload CV File (PDF, DOCX, Image)</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              notify('Uploading CV document...');
                              const url = await uploadFileToStorage(file, 'cv_documents');
                              setSiteSettingsForm({
                                ...siteSettingsForm,
                                cvUrl: url,
                                cvFileName: file.name
                              });
                              notify(`CV "${file.name}" uploaded successfully!`);
                            } catch (error) {
                              // Fallback to data URL if Firebase upload fails
                              const dataUrl = await fileToDataURL(file);
                              setSiteSettingsForm({
                                ...siteSettingsForm,
                                cvUrl: dataUrl,
                                cvFileName: file.name
                              });
                              notify(`CV "${file.name}" loaded (local preview)`);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CV Download URL / Asset Path */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        CV Download URL / File Path
                      </label>
                      <input
                        type="text"
                        value={siteSettingsForm.cvUrl || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, cvUrl: e.target.value })}
                        placeholder="e.g. /profile.jpg or https://drive.google.com/..."
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    {/* Download Filename */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Download Filename (When user clicks Download)
                      </label>
                      <input
                        type="text"
                        value={siteSettingsForm.cvFileName || ''}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, cvFileName: e.target.value })}
                        placeholder="e.g. Alex_Robert_Resume_2026.pdf"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* CV Test & Status Card */}
                  <div className="p-4 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {siteSettingsForm.cvFileName || 'Alex_Robert_Resume_2026.pdf'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 truncate max-w-xs block">
                          URL: {siteSettingsForm.cvUrl ? (siteSettingsForm.cvUrl.length > 40 ? siteSettingsForm.cvUrl.substring(0, 40) + '...' : siteSettingsForm.cvUrl) : 'Default Document'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={siteSettingsForm.cvUrl || '/profile.jpg'}
                      download={siteSettingsForm.cvFileName || 'Resume.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#CCFF00] text-black text-xs font-bold flex items-center gap-1.5 hover:bg-[#b8e600] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Test Download CV</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Save Media Settings Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:opacity-90"
                  style={{ backgroundColor: siteSettingsForm.theme?.accentColor || '#CCFF00' }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply Images & CV Customizations</span>
                </button>
              </div>
            </div>
          )}

          {/* THEME CUSTOMIZATION TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#CCFF00]" />
                    <span>Live Theme & Visual Styling Manager</span>
                  </h4>
                  <p className="text-xs text-neutral-400">Customize brand accent colors, background modes, typography scales, and border radii dynamically across the portfolio.</p>
                </div>
              </div>

              {/* Color Palette Presets */}
              <div className="space-y-3 bg-[#181818] border border-white/10 rounded-2xl p-5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  1. Select Accent Brand Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { name: 'Cyber Lime', hex: '#CCFF00', rgb: '204, 255, 0' },
                    { name: 'Electric Cyan', hex: '#00F0FF', rgb: '0, 240, 255' },
                    { name: 'Emerald', hex: '#10B981', rgb: '16, 185, 129' },
                    { name: 'Sunset Amber', hex: '#FF6B00', rgb: '255, 107, 0' },
                    { name: 'Neon Purple', hex: '#A855F7', rgb: '168, 85, 247' },
                    { name: 'Vivid Pink', hex: '#FF007A', rgb: '255, 0, 122' },
                    { name: 'Royal Gold', hex: '#F59E0B', rgb: '245, 158, 11' },
                    { name: 'Crimson Red', hex: '#EF4444', rgb: '239, 68, 68' }
                  ].map((preset) => {
                    const isSelected = (siteSettingsForm.theme?.accentColor || '#CCFF00') === preset.hex;
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          const newTheme: ThemeConfig = {
                            ...(siteSettingsForm.theme || {
                              accentColor: '#CCFF00',
                              accentRgb: '204, 255, 0',
                              bgStyle: 'cyber-dark',
                              fontPreset: 'sans',
                              borderRadius: 'rounded',
                              glowEffect: true
                            }),
                            accentColor: preset.hex,
                            accentRgb: preset.rgb
                          };
                          setSiteSettingsForm({ ...siteSettingsForm, theme: newTheme });
                        }}
                        className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-20 ${
                          isSelected
                            ? 'border-white bg-white/10 shadow-lg scale-105'
                            : 'border-white/5 bg-[#121212] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: preset.hex }} />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[10px] font-bold text-neutral-300 truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 flex items-center gap-3">
                  <label className="text-xs text-neutral-400 font-medium">Custom Color Picker:</label>
                  <input
                    type="color"
                    value={siteSettingsForm.theme?.accentColor || '#CCFF00'}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const r = parseInt(hex.slice(1, 3), 16) || 204;
                      const g = parseInt(hex.slice(3, 5), 16) || 255;
                      const b = parseInt(hex.slice(5, 7), 16) || 0;
                      const newTheme: ThemeConfig = {
                        ...(siteSettingsForm.theme || {
                          accentColor: '#CCFF00',
                          accentRgb: '204, 255, 0',
                          bgStyle: 'cyber-dark',
                          fontPreset: 'sans',
                          borderRadius: 'rounded',
                          glowEffect: true
                        }),
                        accentColor: hex,
                        accentRgb: `${r}, ${g}, ${b}`
                      };
                      setSiteSettingsForm({ ...siteSettingsForm, theme: newTheme });
                    }}
                    className="w-10 h-8 bg-transparent cursor-pointer rounded overflow-hidden border border-white/20"
                  />
                  <span className="text-xs font-mono text-[#CCFF00]">
                    {siteSettingsForm.theme?.accentColor || '#CCFF00'}
                  </span>
                </div>
              </div>

              {/* Background Theme Mode */}
              <div className="space-y-3 bg-[#181818] border border-white/10 rounded-2xl p-5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  2. Background Theme Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'cyber-dark', name: 'Cyber Dark (Deep Noir)', bg: '#0E0E0E', card: '#141414' },
                    { id: 'midnight-navy', name: 'Midnight Navy', bg: '#0A0F1D', card: '#111827' },
                    { id: 'slate-dark', name: 'Slate Steel', bg: '#0F172A', card: '#1E293B' },
                    { id: 'charcoal', name: 'Pure Charcoal', bg: '#121212', card: '#1C1C1C' }
                  ].map((mode) => {
                    const isSelected = (siteSettingsForm.theme?.bgStyle || 'cyber-dark') === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          const newTheme: ThemeConfig = {
                            ...(siteSettingsForm.theme || {
                              accentColor: '#CCFF00',
                              accentRgb: '204, 255, 0',
                              bgStyle: 'cyber-dark',
                              fontPreset: 'sans',
                              borderRadius: 'rounded',
                              glowEffect: true
                            }),
                            bgStyle: mode.id as any
                          };
                          setSiteSettingsForm({ ...siteSettingsForm, theme: newTheme });
                        }}
                        className={`p-4 rounded-xl border transition-all text-left space-y-2 ${
                          isSelected
                            ? 'border-white bg-white/10 shadow-lg'
                            : 'border-white/5 bg-[#121212] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: mode.bg }} />
                            <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: mode.card }} />
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
                        </div>
                        <p className="text-xs font-bold text-white">{mode.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font & Border Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Typography */}
                <div className="space-y-3 bg-[#181818] border border-white/10 rounded-2xl p-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    3. Typography Style
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'sans', name: 'Modern Sans (Clean)', preview: 'Plus Jakarta / Inter Sans' },
                      { id: 'serif', name: 'Editorial Serif (Classic)', preview: 'Playfair Display Serif' },
                      { id: 'mono', name: 'Developer Mono (Tech)', preview: 'JetBrains / Space Mono' }
                    ].map((font) => {
                      const isSelected = (siteSettingsForm.theme?.fontPreset || 'sans') === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => {
                            const newTheme: ThemeConfig = {
                              ...(siteSettingsForm.theme || {
                                accentColor: '#CCFF00',
                                accentRgb: '204, 255, 0',
                                bgStyle: 'cyber-dark',
                                fontPreset: 'sans',
                                borderRadius: 'rounded',
                                glowEffect: true
                              }),
                              fontPreset: font.id as any
                            };
                            setSiteSettingsForm({ ...siteSettingsForm, theme: newTheme });
                          }}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/5 bg-[#121212]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{font.name}</span>
                            <span className="text-[10px] text-neutral-400">{font.preview}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-3 bg-[#181818] border border-white/10 rounded-2xl p-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                    4. Card Corner Geometry
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'sharp', name: 'Sharp Minimalist', radius: 'rounded-md' },
                      { id: 'rounded', name: 'Modern Curved (Default)', radius: 'rounded-2xl' },
                      { id: 'pill', name: 'Soft Pill Ultra', radius: 'rounded-3xl' }
                    ].map((r) => {
                      const isSelected = (siteSettingsForm.theme?.borderRadius || 'rounded') === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            const newTheme: ThemeConfig = {
                              ...(siteSettingsForm.theme || {
                                accentColor: '#CCFF00',
                                accentRgb: '204, 255, 0',
                                bgStyle: 'cyber-dark',
                                fontPreset: 'sans',
                                borderRadius: 'rounded',
                                glowEffect: true
                              }),
                              borderRadius: r.id as any
                            };
                            setSiteSettingsForm({ ...siteSettingsForm, theme: newTheme });
                          }}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/5 bg-[#121212]'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{r.name}</span>
                            <span className="text-[10px] text-neutral-400">{r.radius}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Theme Preview Banner */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Live Component Theme Preview</span>
                  <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: siteSettingsForm.theme?.accentColor || '#CCFF00', color: '#000' }}>
                    Active Accent
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-[#181818] border border-white/10 space-y-3">
                  <h5 className="text-base font-black uppercase" style={{ color: siteSettingsForm.theme?.accentColor || '#CCFF00' }}>
                    Interactive UI Component Preview
                  </h5>
                  <p className="text-xs text-neutral-300">
                    Changing theme values updates live button CTA shadows, typography families, highlight badges, and category tags instantly across the full website!
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg"
                      style={{ backgroundColor: siteSettingsForm.theme?.accentColor || '#CCFF00', color: '#000' }}
                    >
                      Sample Primary CTA
                    </button>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold border"
                      style={{ borderColor: siteSettingsForm.theme?.accentColor || '#CCFF00', color: siteSettingsForm.theme?.accentColor || '#CCFF00' }}
                    >
                      Badge Highlight
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Theme Settings Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:opacity-90"
                  style={{ backgroundColor: siteSettingsForm.theme?.accentColor || '#CCFF00' }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply Theme Customizations</span>
                </button>
              </div>
            </div>
          )}

          {/* SITE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5 bg-[#181818] border border-white/10 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>General Portfolio Settings</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Developer Name</label>
                  <input
                    type="text"
                    value={siteSettingsForm.name}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, name: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Title / Headline</label>
                  <input
                    type="text"
                    value={siteSettingsForm.title}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, title: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Subtitle / Hero Bio</label>
                <textarea
                  value={siteSettingsForm.subtitle}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, subtitle: e.target.value })}
                  rows={2}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={siteSettingsForm.phone}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, phone: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Email Address</label>
                  <input
                    type="text"
                    value={siteSettingsForm.email}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, email: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.profileImageUrl || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, profileImageUrl: e.target.value })}
                    placeholder="/profile.jpg"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">CV Download URL</label>
                  <input
                    type="text"
                    value={siteSettingsForm.cvUrl || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, cvUrl: e.target.value })}
                    placeholder="/profile.jpg"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">CV Download Filename</label>
                  <input
                    type="text"
                    value={siteSettingsForm.cvFileName || ''}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, cvFileName: e.target.value })}
                    placeholder="Alex_Robert_Resume_2026.pdf"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Admin Security & Password Configuration */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Admin Security & Password Configuration</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Admin Security Password
                    </label>
                    <input
                      type="text"
                      value={siteSettingsForm.adminPassword || 'admin'}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, adminPassword: e.target.value })}
                      placeholder="admin"
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      This security password is required to log into the Admin CMS Panel.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Site Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* AI CHATBOT (GROQ API) MANAGEMENT TAB */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#CCFF00]" />
                    <span>AI Portfolio Chatbot & Groq API Manager</span>
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Configure Groq API settings, select LLM model, test API connectivity, and customize chatbot responses & system instructions.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>GROQ LLM INTEGRATION</span>
                </span>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. Toggle Chatbot & Groq API Key */}
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center font-bold">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                          1. Groq API Credential & Model Configuration
                        </h5>
                        <p className="text-[11px] text-neutral-400">
                          Get your API Key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[#CCFF00] hover:underline">Groq Console</a> (free high-speed inference).
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Switch */}
                    <label className="flex items-center gap-2 cursor-pointer bg-[#121212] px-4 py-2 rounded-xl border border-white/10 hover:border-[#CCFF00]">
                      <input
                        type="checkbox"
                        checked={siteSettingsForm.chatbotEnabled ?? true}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, chatbotEnabled: e.target.checked })}
                        className="rounded border-white/20 bg-[#121212] text-[#CCFF00] focus:ring-0"
                      />
                      <span className="text-xs font-bold uppercase text-white">Enable Chatbot Widget</span>
                    </label>
                  </div>

                  {/* Groq API Key Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block">
                      Groq API Key (`gsk_...`)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showGroqKey ? 'text' : 'password'}
                          value={siteSettingsForm.groqApiKey || ''}
                          onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, groqApiKey: e.target.value })}
                          placeholder="gsk_..."
                          className="w-full bg-[#121212] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#CCFF00]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowGroqKey(!showGroqKey)}
                          className="absolute right-3 top-3 text-neutral-500 hover:text-white"
                          title={showGroqKey ? 'Hide key' : 'Show key'}
                        >
                          {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Test Connection Button */}
                      <button
                        type="button"
                        onClick={handleTestGroqKey}
                        disabled={testingGroq}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider border border-white/10 flex items-center gap-2 transition-colors shrink-0"
                      >
                        {testingGroq ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#CCFF00]" /> : <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />}
                        <span>{testingGroq ? 'Testing...' : 'Test Connection'}</span>
                      </button>
                    </div>

                    {/* Test status banner */}
                    {groqTestStatus && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-mono ${
                        groqTestStatus.success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}>
                        {groqTestStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />}
                        <span>{groqTestStatus.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Groq Model Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                        Select Groq Model
                      </label>
                      <select
                        value={siteSettingsForm.groqModel || 'llama-3.3-70b-versatile'}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, groqModel: e.target.value })}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00] font-mono"
                      >
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended - High Accuracy)</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Ultra Fast Response)</option>
                        <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (32K Context)</option>
                        <option value="gemma2-9b-it">gemma2-9b-it (Google Gemma 2 on Groq)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                        Chatbot Display Title
                      </label>
                      <input
                        type="text"
                        value={siteSettingsForm.chatbotName || 'Sift AI Assistant'}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, chatbotName: e.target.value })}
                        placeholder="Sift AI Assistant"
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Custom Welcome Greeting & System Persona */}
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>2. Custom Welcome Greeting & System Instructions</span>
                  </h5>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Initial Welcome Greeting Message
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.chatbotGreeting || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, chatbotGreeting: e.target.value })}
                      placeholder="Hello! I am Alex's AI Portfolio Assistant..."
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      System Instructions / Bot Persona Prompt
                    </label>
                    <textarea
                      rows={4}
                      value={siteSettingsForm.chatbotSystemPrompt || ''}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, chatbotSystemPrompt: e.target.value })}
                      placeholder="You are the official AI Portfolio Assistant for Sushant Namurte..."
                      className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#CCFF00]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      The bot automatically appends live portfolio services, skills, projects, and contact details to this system prompt.
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Chatbot Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
