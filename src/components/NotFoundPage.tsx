import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E0E0E] via-[#1a1a1a] to-[#0E0E0E] opacity-50"></div>
      
      {/* Glowing accent circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CCFF00] opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CCFF00] opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-[#99cc00] opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-7xl font-bold text-[#CCFF00]">404</span>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Page Not Found
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Auto-redirect countdown */}
        <div className="mb-8 text-gray-500">
          Redirecting to home in <span className="text-[#CCFF00] font-semibold">{countdown}</span> seconds...
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-[#b3e600] transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful suggestions */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/#about')}
              className="px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 hover:text-[#CCFF00] transition"
            >
              About
            </button>
            <button
              onClick={() => navigate('/#projects')}
              className="px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 hover:text-[#CCFF00] transition"
            >
              Projects
            </button>
            <button
              onClick={() => navigate('/#blog')}
              className="px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 hover:text-[#CCFF00] transition"
            >
              Blog
            </button>
            <button
              onClick={() => navigate('/#contact')}
              className="px-4 py-2 bg-white/5 text-gray-400 text-sm rounded-lg hover:bg-white/10 hover:text-[#CCFF00] transition"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
