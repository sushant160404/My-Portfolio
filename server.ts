import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory / Server API backup endpoints to support REST API specs
// The client also syncs directly with Firestore for real-time responsiveness
let siteSettings = {
  name: 'Sushant Namurte',
  title: 'A JUNIOR SOFTWARE ENGINEER & DEVELOPER',
  subtitle: 'As a dedicated professional with a passion for Sift, I bring 10+ years of experience in ui/ux design & development throughout best of my career.',
  aboutTitle: 'BEST JUNIOR SOFTWARE ENGINEER & DEVELOPER IN USA',
  aboutText: 'At Sift, we understand that success is just about delivering a product - it\'s about building relationships and making a meaningful impact of client.',
  phone: '281-789-6642',
  email: 'info@siftmedia.com',
  location: 'New York, NY, USA',
  cvUrl: '#download-cv',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  stats: {
    projectsCompleted: '1K',
    satisfiedCustomers: '1K',
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
  }
};

let contactMessages: Array<{
  id: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
}> = [];

let newsletterSubscribers: Array<{ id: string; email: string; subscribedAt: string }> = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/settings', (req, res) => {
  res.json(siteSettings);
});

app.post('/api/settings', (req, res) => {
  siteSettings = { ...siteSettings, ...req.body };
  res.json({ success: true, settings: siteSettings });
});

app.post('/api/contact', (req, res) => {
  const { fullName, phoneNumber, email, subject, message } = req.body;
  if (!email || !message || !fullName) {
    res.status(400).json({ error: 'Full name, email, and message are required.' });
    return;
  }
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName,
    phoneNumber: phoneNumber || '',
    email,
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString(),
    status: 'unread'
  };
  contactMessages.unshift(newMessage);
  console.log('New Contact Form Message received:', newMessage);
  res.json({ success: true, message: 'Message sent successfully!', data: newMessage });
});

app.get('/api/contact', (req, res) => {
  res.json({ success: true, messages: contactMessages });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  const subscriber = {
    id: `sub_${Date.now()}`,
    email,
    subscribedAt: new Date().toISOString()
  };
  newsletterSubscribers.push(subscriber);
  res.json({ success: true, message: 'Subscribed to newsletter successfully!' });
});

// Groq AI Chatbot Proxy Route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKey, model, systemPrompt, portfolioContext } = req.body;

    const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GROQ_API_KEY || (siteSettings as any).groqApiKey;

    if (!effectiveApiKey || !effectiveApiKey.trim()) {
      res.status(400).json({
        error: 'NO_GROQ_KEY',
        message: 'No Groq API Key configured. Please enter your Groq API Key in the Admin Panel -> AI Chatbot tab or configure GROQ_API_KEY in server environment.'
      });
      return;
    }

    const selectedModel = model || (siteSettings as any).groqModel || 'llama-3.3-70b-versatile';

    const contextPrompt = portfolioContext || `
You are the official AI Portfolio Assistant for Sushant Namurte (Sift Media).
Sushant Namurte is a Lead Junior Software Engineer & Full-Stack Developer with 10+ years of experience.
Contact Email: ${siteSettings.email || 'info@siftmedia.com'}
Phone: ${siteSettings.phone || '281-789-6642'}
Location: ${siteSettings.location || 'New York, NY, USA'}
Services Offered: UI/UX Design, Web Application Development, Full-Stack Architecture, Design Systems, Mobile Apps.
Stats: ${siteSettings.stats?.yearsExperience || '10+'} Experience, ${siteSettings.stats?.projectsCompleted || '12K'} Projects completed, ${siteSettings.stats?.satisfiedCustomers || '10K'} Clients.

Your Role:
1. Answer visitor questions about Sushant Namurte, services, skills, portfolio projects, and availability.
2. Maintain a friendly, professional, and knowledgeable tone.
3. Keep responses clean, concise, and structured with bullet points where appropriate.
4. Encourage visitors to use the Contact Form or email Alex directly for project inquiries.
`;

    const fullSystemPrompt = systemPrompt ? `${systemPrompt}\n\n${contextPrompt}` : contextPrompt;

    const payloadMessages = [
      { role: 'system', content: fullSystemPrompt },
      ...(Array.isArray(messages) ? messages : [])
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      console.error('Groq API Error:', errData);
      res.status(groqResponse.status).json({
        error: 'GROQ_API_ERROR',
        message: errData.error?.message || `Groq API responded with status ${groqResponse.status}`
      });
      return;
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process your request right now.";

    res.json({
      success: true,
      reply,
      model: selectedModel,
      usage: data.usage
    });
  } catch (err: any) {
    console.error('Chat API Handler Error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Internal server error' });
  }
});

// Test Groq API Key endpoint for Admin Panel
app.post('/api/chat/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const effectiveApiKey = (apiKey && apiKey.trim()) || process.env.GROQ_API_KEY || (siteSettings as any).groqApiKey;

    if (!effectiveApiKey || !effectiveApiKey.trim()) {
      res.status(400).json({ success: false, message: 'Please enter a Groq API Key to test.' });
      return;
    }

    const testResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: 'Say "Groq API Connection Successful!" in 5 words.' }
        ],
        max_tokens: 20
      })
    });

    if (!testResponse.ok) {
      const errData = await testResponse.json().catch(() => ({}));
      res.status(400).json({
        success: false,
        message: errData.error?.message || `Groq connection failed with status ${testResponse.status}`
      });
      return;
    }

    const data = await testResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'Connection OK';

    res.json({
      success: true,
      message: 'Groq API Key is valid and working!',
      reply
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Test failed: ${err.message}` });
  }
});

// Blog CRUD REST endpoints (in-memory fallback; primary store is Firestore)
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  contentBlocks?: any[];
  featuredImage?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
  readTime?: string;
  featured?: boolean;
  status?: 'published' | 'draft';
  tableOfContents?: boolean;
  seriesId?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  views?: number;
  likes?: number;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  author?: { name: string; avatar?: string; bio?: string; role?: string };
}

let blogs: BlogPost[] = [];

// GET all blogs (optionally filter by status)
app.get('/api/blogs', (req, res) => {
  const { status, category, featured } = req.query;
  let result = blogs;
  if (status) result = result.filter(b => b.status === status);
  else result = result.filter(b => (b.status || 'published') === 'published');
  if (category) result = result.filter(b => b.category === category);
  if (featured === 'true') result = result.filter(b => b.featured);
  res.json({ success: true, blogs: result });
});

// GET single blog by id or slug
app.get('/api/blogs/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const blog = blogs.find(b => b.id === idOrSlug || b.slug === idOrSlug);
  if (!blog) { res.status(404).json({ error: 'Blog post not found' }); return; }
  // Increment view count
  blog.views = (blog.views || 0) + 1;
  res.json({ success: true, blog });
});

// POST create blog
app.post('/api/blogs', (req, res) => {
  const body = req.body;
  if (!body.title) { res.status(400).json({ error: 'title is required' }); return; }
  const id = body.id || `b_${Date.now()}`;
  const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const blog: BlogPost = {
    ...body,
    id,
    slug,
    publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    status: body.status || 'published',
    views: body.views || 0,
    likes: body.likes || 0,
    seoTitle: body.seoTitle || `${body.title} | Sift Media`,
    metaDescription: body.metaDescription || body.excerpt || '',
    canonicalUrl: body.canonicalUrl || `https://siftmedia.com/blog/${slug}`,
    ogImage: body.ogImage || body.featuredImage || '',
  };
  // Replace if exists
  const existing = blogs.findIndex(b => b.id === id);
  if (existing >= 0) blogs[existing] = blog;
  else blogs.unshift(blog);
  res.status(201).json({ success: true, blog });
});

// PUT update blog
app.put('/api/blogs/:id', (req, res) => {
  const idx = blogs.findIndex(b => b.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: 'Blog post not found' }); return; }
  blogs[idx] = { ...blogs[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString().split('T')[0] };
  res.json({ success: true, blog: blogs[idx] });
});

// DELETE blog
app.delete('/api/blogs/:id', (req, res) => {
  const idx = blogs.findIndex(b => b.id === req.params.id);
  if (idx < 0) { res.status(404).json({ error: 'Blog post not found' }); return; }
  blogs.splice(idx, 1);
  res.json({ success: true });
});

// Admin Authentication endpoint simulation
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (password === 'admin123' || password === 'sift2026' || username === 'admin') {
    res.json({ success: true, token: 'mock-jwt-token-sift-admin', user: { name: 'Sushant Namurte', role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
