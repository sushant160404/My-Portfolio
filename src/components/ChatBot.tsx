import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Sparkles, RefreshCw, Bot, User,
  CheckCircle2, ArrowRight, Shield, Zap, ExternalLink, Mail, Code
} from 'lucide-react';
import { SiteSettings, Project, Service, Skill, Blog } from '../types';

interface ChatBotProps {
  settings: SiteSettings;
  projects?: Project[];
  services?: Service[];
  skills?: Skill[];
  blogs?: Blog[];
  onOpenContact?: () => void;
  onSelectProject?: (p: Project) => void;
  onSelectBlog?: (b: Blog) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  settings,
  projects = [],
  services = [],
  skills = [],
  blogs = [],
  onOpenContact,
  onSelectProject,
  onSelectBlog
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(true);

  const chatbotName = settings.chatbotName || 'Sift AI Assistant';
  const chatbotGreeting = settings.chatbotGreeting || 'Hello! I am Alex\'s AI Portfolio Assistant powered by Groq. Ask me anything about Alex\'s skills, UI/UX services, or recent case studies!';
  const isEnabled = settings.chatbotEnabled ?? true;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: chatbotGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadBadge(false);
    }
  }, [messages, isOpen]);

  if (!isEnabled) return null;

  // Suggested quick prompt chips
  const quickPrompts = [
    'What services do you offer?',
    'Show me Alex\'s top projects',
    'What is your tech stack?',
    'How do I hire or contact Alex?'
  ];

  // Generate comprehensive portfolio context string
  const generatePortfolioContext = () => {
    const projectsSummary = projects.slice(0, 5).map(p => `- ${p.title} (${p.category}): ${p.shortDescription} [Tech: ${p.technologies.join(', ')}]`).join('\n');
    const servicesSummary = services.map(s => `- ${s.title}: ${s.description}`).join('\n');
    const skillsSummary = skills.map(sk => `- ${sk.name} (${sk.category}): ${sk.percentage}%`).join('\n');
    const blogsSummary = blogs.slice(0, 3).map(b => `- "${b.title}" (${b.category}): ${b.excerpt}`).join('\n');

    return `
BACKGROUND CONTEXT FOR SUSHANT NAMURTE (SIFT MEDIA):
Name: ${settings.name || 'Sushant Namurte'}
Title: ${settings.title || 'Lead Junior Software Engineer & Full-Stack Architect'}
About: ${settings.aboutText || '10+ years of experience in UI/UX design & full-stack development.'}
Email: ${settings.email || 'info@siftmedia.com'}
Phone: ${settings.phone || '281-789-6642'}
Location: ${settings.location || 'New York, NY, USA'}
Stats: ${settings.stats?.yearsExperience || '10+'} Years Exp, ${settings.stats?.projectsCompleted || '12K'} Projects Completed, ${settings.stats?.satisfiedCustomers || '10K'} Clients, Rating ${settings.stats?.clientRating || '4.9/5'}.

SERVICES OFFERED:
${servicesSummary || 'UI/UX Design, Web App Development, Full-Stack Architecture, Design Systems'}

FEATURED PROJECTS:
${projectsSummary || 'SaaS Analytics Dashboard, E-Commerce Platform, Mobile App'}

TECHNICAL SKILLS:
${skillsSummary || 'React, TypeScript, Node.js, Tailwind CSS, PostgreSQL, Figma'}

RECENT BLOG ARTICLES:
${blogsSummary || 'Building Scalable Web Apps, Modern Design Systems'}
`;
  };

  // Fallback local smart answer if Groq API key is not configured or fails
  const generateLocalFallbackAnswer = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('service') || q.includes('offer') || q.includes('do')) {
      const serviceList = services.map(s => `• **${s.title}**: ${s.description}`).join('\n');
      return `Alex offers premier full-stack design & engineering services:\n\n${serviceList || '• UI/UX Design\n• Web & Mobile Engineering\n• Design Systems'}\n\nWould you like to start a project? Feel free to use the contact form!`;
    }

    if (q.includes('project') || q.includes('case study') || q.includes('work') || q.includes('portfolio')) {
      const projList = projects.slice(0, 4).map(p => `• **${p.title}** (${p.category}): ${p.shortDescription}`).join('\n');
      return `Here are some of Alex's featured case studies:\n\n${projList}\n\nYou can click on any project card on the homepage to read the full case study!`;
    }

    if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language')) {
      const topSkills = skills.slice(0, 6).map(s => `${s.name} (${s.percentage}%)`).join(', ');
      return `Alex's core engineering & design stack includes:\n\n• **Frontend & UI**: React, TypeScript, Tailwind CSS, Next.js, Figma\n• **Backend & DB**: Node.js, Express, PostgreSQL, Firebase, REST APIs\n• **Proficiencies**: ${topSkills}\n\nAll designs follow clean component architectures and WCAG accessibility guidelines!`;
    }

    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach') || q.includes('phone')) {
      return `You can get in touch with Alex directly:\n\n• **Email**: ${settings.email}\n• **Phone**: ${settings.phone}\n• **Location**: ${settings.location}\n\nOr click the **Contact** section at the top to send a direct message!`;
    }

    return `Sushant Namurte is a Lead Junior Software Engineer & Full-Stack Architect with ${settings.stats?.yearsExperience || '10+'} years of experience building high-impact digital products.\n\nKey highlights:\n• Over ${settings.stats?.projectsCompleted || '12K'} projects delivered\n• ${settings.stats?.satisfiedCustomers || '10K'} satisfied client reviews\n• Direct Email: ${settings.email}\n\n*(Note: For live real-time LLM responses, you can configure your Groq API Key in the Admin Panel → AI Chatbot tab!)*`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Prepare message payload for Groq
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      historyPayload.push({ role: 'user', content: queryText });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          apiKey: settings.groqApiKey,
          model: settings.groqModel || 'llama-3.3-70b-versatile',
          systemPrompt: settings.chatbotSystemPrompt,
          portfolioContext: generatePortfolioContext()
        })
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.model || 'Groq Llama-3.3'
        };
        setMessages(prev => [...prev, botMsg]);
      } else if (data.error === 'NO_GROQ_KEY') {
        // Fallback with local portfolio search
        const fallbackText = generateLocalFallbackAnswer(queryText);
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          text: `${fallbackText}\n\n*💡 Tip: Add a Groq API Key in Admin Panel → AI Chatbot tab for instant Groq Llama-3.3 responses!*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Local Portfolio Search (Groq Key Pending)'
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        // Handle error gracefully
        const fallbackText = generateLocalFallbackAnswer(queryText);
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          text: `${fallbackText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = generateLocalFallbackAnswer(queryText);
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'bot',
        text: chatbotGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {!isOpen && unreadBadge && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CCFF00] text-black font-black text-[10px] uppercase tracking-wider shadow-[0_0_20px_rgba(204,255,0,0.4)] animate-bounce">
            <Sparkles className="w-3 h-3" />
            <span>Ask Groq AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative ${
            isOpen
              ? 'bg-neutral-900 border border-white/20 text-white rotate-90 scale-95'
              : 'bg-[#CCFF00] text-black hover:scale-110 shadow-[0_0_30px_rgba(204,255,0,0.5)] border-2 border-[#CCFF00]'
          }`}
          title={isOpen ? 'Close Chatbot' : 'Ask Sift AI Assistant'}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-7 h-7" />
              {unreadBadge && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-black animate-ping" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Expanded Chat Widget Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[80vh] bg-[#141414] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-fadeIn">
          
          {/* Widget Header */}
          <div className="p-4 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold shadow-md relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>{chatbotName}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[9px] font-mono">
                    GROQ AI
                  </span>
                </h4>
                <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#CCFF00]" />
                  <span>{settings.groqModel || 'llama-3.3-70b'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
                title="Minimize chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0E0E0E]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#CCFF00] text-black font-semibold rounded-tr-none shadow-md'
                      : 'bg-[#181818] text-neutral-200 border border-white/10 rounded-tl-none space-y-1.5'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  <div className={`flex items-center justify-between gap-2 text-[9px] font-mono mt-1 ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-neutral-500'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && msg.sender === 'bot' && (
                      <span className="text-[#CCFF00] truncate">{msg.modelUsed}</span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-1 font-bold text-xs border border-white/10">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono bg-[#181818] border border-white/5 w-fit p-3 rounded-2xl rounded-tl-none animate-pulse">
                <Bot className="w-4 h-4 text-[#CCFF00] animate-spin" />
                <span>Sift AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length < 5 && (
            <div className="px-3 py-2 bg-[#121212] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-[#CCFF00] text-[10px] text-neutral-300 hover:text-white font-mono whitespace-nowrap transition-colors shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-[#181818] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Alex's AI Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[#101010] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !loading
                    ? 'bg-[#CCFF00] text-black hover:scale-105'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
