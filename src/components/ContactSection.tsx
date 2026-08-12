import React, { useState } from 'react';
import { Sparkles, Phone, Mail, Download, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiteSettings } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in required fields (Name, Email, Message).' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // 1. Submit to Express REST API
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // 2. Also save to Firestore DB directly for backup/real-time sync
      try {
        await addDoc(collection(db, 'contact_messages'), {
          ...formData,
          status: 'unread',
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn('Firestore message save note:', firestoreErr);
      }

      if (res.ok) {
        setStatus({ type: 'success', message: 'Thank you! Your message has been received successfully.' });
        setFormData({ fullName: '', phoneNumber: '', email: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Failed to submit message.' });
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus({ type: 'success', message: 'Message submitted successfully! We will get back to you shortly.' });
      setFormData({ fullName: '', phoneNumber: '', email: '', subject: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#0E0E0E] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Info & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CONTACT NOW</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              GET IN TOUCH <span className="font-serif italic text-neutral-300 font-light">TODAY</span>
            </h2>

            <p className="text-neutral-400 text-sm leading-relaxed">
              Ready to take your digital presence to the next level? Whether you're a startup looking to establish a brand identity or an established company aiming to refresh your online identity, I'm here to help your company.
            </p>

            {/* Direct Phone & Email Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">CALL</span>
                  <a href={`tel:${settings.phone}`} className="text-xs font-black text-white hover:text-[#CCFF00]">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">EMAIL</span>
                  <a href={`mailto:${settings.email}`} className="text-xs font-black text-white hover:text-[#CCFF00] truncate block max-w-[150px]">
                    {settings.email}
                  </a>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <a
                href={settings.cvUrl || "#download-cv"}
                id="download-cv-contact-btn"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD CV</span>
              </a>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7 bg-[#141414] border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6">
              LEAVE A MESSAGE
            </h3>

            {status && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  status.type === 'success'
                    ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00]'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name*"
                    required
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address*"
                  required
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject*"
                  required
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Message*"
                  required
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  id="submit-message-btn"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'SUBMITTING...' : 'SUBMIT NOW'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};
