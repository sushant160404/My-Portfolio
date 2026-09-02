export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  thumbnail: string;
  category: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order?: number;
  problem?: string;
  solution?: string;
  features?: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  percentage: number;
  icon: string;
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  image?: string;
  featured: boolean;
}

export interface BlogContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'code' | 'quote' | 'list' | 'divider' | 'callout' | 'video' | 'embed';
  content: string;
  language?: string;   // for code blocks
  level?: number;      // for headings (1-6)
  items?: string[];    // for lists
  ordered?: boolean;   // for lists
  caption?: string;    // for images / videos
  style?: 'info' | 'warning' | 'success' | 'tip'; // for callouts
  url?: string;        // for video/embed
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentBlocks?: BlogContentBlock[]; // Rich long-form content
  featuredImage: string;
  category: string;
  tags: string[];
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  featured: boolean;
  status?: 'published' | 'draft';  // draft support
  views?: number;
  likes?: number;
  // Series / multi-part
  seriesId?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  // SEO
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  tableOfContents?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  order: number;
}

export interface ContactMessage {
  id?: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
  status?: 'unread' | 'read' | 'archived';
}

export interface AboutCarouselCard {
  id: string;
  tag: string;
  title: string;
  label: string;
  accent: string;
  image?: string;
}

export interface ThemeConfig {
  accentColor: string;
  accentRgb: string;
  bgStyle: 'cyber-dark' | 'midnight-navy' | 'slate-dark' | 'charcoal';
  fontPreset: 'sans' | 'serif' | 'mono';
  borderRadius: 'sharp' | 'rounded' | 'pill';
  glowEffect: boolean;
}

export interface SiteSettings {
  name: string;
  title: string;
  subtitle: string;
  aboutTitle: string;
  aboutText: string;
  phone: string;
  email: string;
  location: string;
  cvUrl: string;
  cvFileName?: string;
  profileImageUrl?: string;
  aboutImageUrl?: string;
  videoUrl: string;
  stats: {
    projectsCompleted: string;
    satisfiedCustomers: string;
    yearsExperience: string;
    clientRating: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    dribbble?: string;
    github?: string;
  };
  adminPassword?: string;
  theme?: ThemeConfig;
  aboutCarousel?: AboutCarouselCard[];
  // Groq AI Chatbot settings
  groqApiKey?: string;
  groqModel?: string;
  chatbotEnabled?: boolean;
  chatbotName?: string;
  chatbotGreeting?: string;
  chatbotSystemPrompt?: string;
}
