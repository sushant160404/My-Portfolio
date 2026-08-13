import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[#121212] text-white border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SUBSCRIBE NEWSLETTER</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          STAY UP TO DATE WITH <br />
          Sushant <span className="font-serif italic text-neutral-300 font-light">NEWSLETTER</span>
        </h2>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you for subscribing to our newsletter!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto pt-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address*"
              required
              className="w-full sm:w-80 bg-[#1C1C1C] border border-white/10 rounded-full px-6 py-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50"
            >
              {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE NOW'}
            </button>
          </form>
        )}

      </div>
    </section>
  );
};
