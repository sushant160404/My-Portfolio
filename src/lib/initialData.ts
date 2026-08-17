import {
  Project,
  Service,
  Skill,
  Experience,
  Education,
  Certificate,
  Blog,
  Testimonial,
  SiteSettings
} from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  name: 'Sushant Namurte',
  title: 'A JUNIOR SOFTWARE ENGINEER & DEVELOPER',
  subtitle: 'As a dedicated professional with a passion for Sift, I bring 1+ years of experience in ui/ux design & development throughout best of my career.',
  aboutTitle: 'BEST JUNIOR SOFTWARE ENGINEER & DEVELOPER IN INDIA',
  aboutText: 'At Sift, we understand that success is just about delivering a product - it\'s about building relationships and making a meaningful impact of client.',
  phone: '+91 9172257304',
  email: 'sushantnamurte@gmail.com',
  location: 'Nagpur, Maharastra, India',
  cvUrl: '/profile.jpg',
  cvFileName: 'Alex_Robert_Resume_2026.pdf',
  profileImageUrl: '/profile.jpg',
  aboutImageUrl: '/avatar.jpg',
  videoUrl: '#',
  stats: {
    projectsCompleted: '12K',
    satisfiedCustomers: '10K',
    yearsExperience: '1+',
    clientRating: '4.9/5'
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    dribbble: 'https://dribbble.com',
    github: 'https://github.com'
  },
  adminPassword: 'admin',
  theme: {
    accentColor: '#CCFF00',
    accentRgb: '204, 255, 0',
    bgStyle: 'cyber-dark',
    fontPreset: 'sans',
    borderRadius: 'rounded',
    glowEffect: true
  },
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  chatbotEnabled: true,
  chatbotName: 'Sift AI Assistant',
  chatbotGreeting: 'Hello! I am Sushant\'s AI Portfolio Assistant. How can I help you today? Ask me about Sushant\'s skills, projects, UI/UX services, or hiring availability!',
  chatbotSystemPrompt: 'You are the official AI Portfolio Assistant for Sushant Namurte (Sift Media). You are helpful, professional, friendly, and knowledgeable. Answer questions accurately based on Sushant\'s portfolio details (services, projects, skills, contact info). Keep responses clear, concise, and beautifully formatted.'
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    title: 'UI/UX DESIGN',
    description: 'UI/UX design is the cornerstone of creating exceptional digital experiences that seamlessly blend aesthetics with functionality. At Sift, we believe in the power of intuitive.',
    icon: 'Layout',
    order: 1
  },
  {
    id: 's2',
    title: 'FRONT-END DEVELOPMENT',
    description: 'Front-end development is the art of bringing designs to life, transforming static visuals into dynamic and interactive digital experiences. At Sift, we specialise in crafting front-end solutions that captivate users & drive.',
    icon: 'Code2',
    order: 2
  },
  {
    id: 's3',
    title: 'CMS DEVELOPMENT',
    description: 'At Sift, we specialise in crafting bespoke CMS solutions tailored to meet the unique needs of your business, empowering your team with flexible content tools.',
    icon: 'Layers',
    order: 3
  },
  {
    id: 's4',
    title: 'WP DEVELOPMENT',
    description: 'At Sift, we specialise in crafting bespoke WordPress solutions tailored to meet the unique needs of your business, delivering high-performance plugins and themes.',
    icon: 'Globe',
    order: 4
  },
  {
    id: 's5',
    title: 'PHP DEVELOPMENT',
    description: 'At Sift, we specialise in crafting robust PHP backends and API endpoints tailored to scale securely with enterprise-level traffic and database efficiency.',
    icon: 'Terminal',
    order: 5
  },
  {
    id: 's6',
    title: 'BRANDING IDENTITY',
    description: 'At Sift, we understand the transformative power of branding identity in shaping perceptions & fostering connections. We believe that a strong brand identity goes beyond just a logo: it\'s about crafting a cohesive story.',
    icon: 'Tag',
    order: 6
  },
  {
    id: 's7',
    title: 'LOGO DESIGN',
    description: 'At Sift, we recognise the significance of a logo as the cornerstone of a brand\'s visual identity. Our logo design process is driven by a deep understanding of your brand\'s essence, values, and target audience.',
    icon: 'Sparkles',
    order: 7
  }
];

export const INITIAL_SKILLS: Skill[] = [
  { id: 'sk1', name: 'FIGMA', category: 'Design', percentage: 96, icon: 'Figma', order: 1 },
  { id: 'sk2', name: 'SKETCH', category: 'Design', percentage: 99, icon: 'Palette', order: 2 },
  { id: 'sk3', name: 'WP DEVELOPMENT', category: 'Development', percentage: 96, icon: 'Globe', order: 3 },
  { id: 'sk4', name: 'PHOTOSHOP', category: 'Design', percentage: 70, icon: 'Image', order: 4 },
  { id: 'sk5', name: 'WEBFLOW', category: 'Development', percentage: 100, icon: 'Zap', order: 5 },
  { id: 'sk6', name: 'REACT & NODE.JS', category: 'Development', percentage: 95, icon: 'Code', order: 6 },
  { id: 'sk7', name: 'POSTGRESQL & FIRESTORE', category: 'Database', percentage: 92, icon: 'Database', order: 7 }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'AI Powered Email Deliverability & Reputation Tool',
    slug: 'ai-email-deliverability-tool',
    shortDescription: 'Unleash the Potential of Your Emails with Quad - Smart inbox routing and real-time spam diagnostics.',
    fullDescription: 'An enterprise SaaS web platform built with React, Node.js, and PostgreSQL to measure email domain health, warm up IP ranges, and optimize open rates using AI diagnostics.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    category: 'SaaS Platform',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Gemini AI'],
    githubUrl: 'https://github.com/sift/iquad-email-ai',
    liveUrl: 'https://iquad-demo.example.com',
    featured: true,
    order: 1,
    problem: 'Email marketers struggled with low inbox placement and high spam flag rates across cold email campaigns.',
    solution: 'Engineered an automated domain warming algorithm with real-time reputation scoring and AI subject line optimizer.',
    features: [
      'Automated IP/Domain warming',
      'Real-time Spam Score diagnostics',
      'AI-driven Subject Line Enhancer',
      'Interactive Analytics Dashboard'
    ]
  },
  {
    id: 'p2',
    title: 'Unlock Seamless Project Management with Quad',
    slug: 'seamless-project-management-quad',
    shortDescription: 'All-in-one collaborative workspace for modern product teams and remote agency developers.',
    fullDescription: 'A next-generation team collaboration application featuring real-time task boards, automated roadmap tracking, and dynamic resource allocation.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    category: 'Web App',
    technologies: ['React', 'TypeScript', 'Express', 'Firestore', 'Framer Motion'],
    githubUrl: 'https://github.com/sift/quad-project-pm',
    liveUrl: 'https://quad-pm.example.com',
    featured: true,
    order: 2,
    problem: 'Teams lost context across disparate tools for messaging, Kanban boards, and sprint goal documentation.',
    solution: 'Unified sprint planning, dynamic Gantt charts, and real-time document editing into a single dark-mode web console.',
    features: [
      'Real-time multiplayer drag-and-drop boards',
      'Sprint timeline & Gantt chart views',
      'Role-based permissions & admin audit logs',
      'Integrated time tracking & workload reports'
    ]
  },
  {
    id: 'p3',
    title: 'Sift Digital Growth & Analytics Portal',
    slug: 'sift-digital-growth-analytics',
    shortDescription: 'Elevate your rankings with our ultimate best SEO and web analytics management solution.',
    fullDescription: 'Comprehensive marketing intelligence suite designed to monitor keyword positions, backlink velocity, and organic search conversions.',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    category: 'Dashboard',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'Recharts'],
    githubUrl: 'https://github.com/sift/seo-growth-portal',
    liveUrl: 'https://analytics.siftmedia.com',
    featured: true,
    order: 3,
    problem: 'Agencies lacked a white-labeled client portal to display live rank shifts and organic traffic ROI clearly.',
    solution: 'Designed a high-contrast dark dashboard with interactive vector charts, instant PDF export, and custom threshold alerts.',
    features: [
      'Live SERP rank tracking across 50+ search engines',
      'Competitor backlink audit tool',
      'Custom white-label reporting engine',
      'Automated weekly email summaries'
    ]
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: 'Working with FeatherDev was an absolute pleasure! Their keen eye for detail and user-centric approach truly elevated our project. From concept to execution, they guided us seamlessly through the design & development process, delivering results that exceeded our expectation',
    name: 'Oliver Grioud',
    role: 'CEO, Lava Ltd',
    company: 'Lava Ltd',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    order: 1
  },
  {
    id: 't2',
    quote: 'Sushant Namurte transformed our cluttered legacy interface into a crisp, ultra-intuitive dark SaaS platform. Our user engagement skyrocketed by 140% in the first quarter post-launch!',
    name: 'Sarah Jenkins',
    role: 'Head of Product, Spherule',
    company: 'Spherule',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    order: 2
  },
  {
    id: 't3',
    quote: 'The speed, precision, and technical depth Alex brings to full-stack engineering is unmatched. Delivering a full-stack Node & React architecture ahead of schedule was incredible.',
    name: 'Marcus Vance',
    role: 'CTO, Lightbox Systems',
    company: 'Lightbox Systems',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    order: 3
  }
];

export const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: 'e1',
    company: 'Sift Digital Studio',
    role: 'Lead UI/UX Designer & Senior Front-End Developer',
    location: 'New York, USA',
    startDate: '2021',
    endDate: 'Present',
    description: 'Directing product design systems, React architectures, and high-converting web applications for global SaaS clients.',
    isCurrent: true,
    order: 1
  },
  {
    id: 'e2',
    company: 'FeatherDev Labs',
    role: 'Senior Product Designer',
    location: 'San Francisco, USA',
    startDate: '2018',
    endDate: '2021',
    description: 'Spearheaded user research, interactive wireframing, and component library creation in Figma for enterprise clients.',
    isCurrent: false,
    order: 2
  },
  {
    id: 'e3',
    company: 'GlobalBank Media',
    role: 'UI/UX Developer',
    location: 'Boston, USA',
    startDate: '2015',
    endDate: '2018',
    description: 'Crafted responsive mobile and web dashboard layouts with strict accessibility and brand consistency standards.',
    isCurrent: false,
    order: 3
  }
];

export const INITIAL_BLOGS: Blog[] = [
  {
    id: 'b1',
    title: 'Mastering Modern UI/UX Design Systems in 2026',
    slug: 'mastering-modern-ui-ux-design-systems',
    excerpt: 'Explore how component tokens, high-contrast dark modes, and micro-animations redefine digital experiences.',
    content: 'Building a modern design system requires a harmonic balance between mathematical spacing scales, WCAG accessible contrast, and fluid motion transitions. In this article, we break down the core architecture of Sift UI...',
    featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    category: 'UI/UX Design',
    tags: ['Design Systems', 'Figma', 'Tailwind', 'UX'],
    publishedAt: '2026-07-28',
    readTime: '5 min read',
    featured: true,
    views: 1420,
    seoTitle: 'Mastering Modern UI/UX Design Systems in 2026 | Sift Media',
    metaDescription: 'Learn how component design tokens, high-contrast dark mode palettes, and fluid CSS animations elevate modern web design systems in 2026.',
    keywords: ['UI UX Design System', 'Figma Tokens', 'Tailwind CSS', 'User Experience 2026'],
    canonicalUrl: 'https://siftmedia.com/blog/mastering-modern-ui-ux-design-systems',
    ogImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    noIndex: false
  },
  {
    id: 'b2',
    title: 'Building Scalable Full-Stack REST APIs with Node.js & Express',
    slug: 'building-scalable-full-stack-rest-apis',
    excerpt: 'Learn standard patterns for secure JWT/session authentication, database pooling, and clean Express routing.',
    content: 'When architecting backend APIs for high-throughput web applications, clean separation of concerns is paramount. Controller handlers, input validation schemas, and database ORMs ensure long-term code maintainability...',
    featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    category: 'Development',
    tags: ['Node.js', 'Express', 'PostgreSQL', 'API'],
    publishedAt: '2026-08-04',
    readTime: '7 min read',
    featured: true,
    views: 980,
    seoTitle: 'Building Scalable REST APIs with Node.js & Express | Sushant Namurte',
    metaDescription: 'Comprehensive guide to building enterprise Node.js & Express APIs with JWT security, connection pooling, and RESTful routing best practices.',
    keywords: ['Node.js REST API', 'Express.js Backend', 'PostgreSQL Pooling', 'Web API Security'],
    canonicalUrl: 'https://siftmedia.com/blog/building-scalable-full-stack-rest-apis',
    ogImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    noIndex: false
  }
];
