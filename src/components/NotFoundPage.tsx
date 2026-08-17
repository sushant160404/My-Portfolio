import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="text-white text-sm tracking-wider">YOUR NAME</div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse"></span>
            <span className="text-gray-400 text-sm uppercase tracking-wide">Available for Freelance</span>
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#CCFF00] transition">DRIBBBLE</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#CCFF00] transition">INSTAGRAM</a>
          </div>
          <button
            onClick={() => navigate('/#contact')}
            className="bg-[#CCFF00] text-black px-6 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b3e600] transition"
          >
            Let's Talk
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          {/* 404 with Eye */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center gap-4">
              {/* First 4 */}
              <span className="text-[180px] md:text-[240px] leading-none font-bold text-white">4</span>
              
              {/* Eye in 0 */}
              <div className="relative">
                <div className="w-[180px] h-[240px] md:w-[240px] md:h-[320px] border-[20px] border-[#CCFF00] rounded-full flex items-center justify-center">
                  {/* Outer eye circle */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#CCFF00] rounded-full flex items-center justify-center">
                    {/* Pupil */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center">
                      {/* Inner dot */}
                      <div className="w-4 h-4 bg-[#CCFF00] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Second 4 */}
              <span className="text-[180px] md:text-[240px] leading-none font-bold text-white">4</span>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-2">
            <span className="text-white">SORRY, THERE'S</span>
          </h1>
          <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
            <span className="text-[#CCFF00]">NOTHING HERE</span>
          </h2>

          {/* Button */}
          <button
            onClick={() => navigate('/')}
            className="bg-[#CCFF00] text-black px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#b3e600] transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 flex items-center justify-between text-gray-500 text-sm">
        <div>{new Date().getMonth() + 1}/{new Date().getFullYear()}</div>
        <div>YOUR NAME © {new Date().getFullYear()}</div>
        <div>CODED BY NAME</div>
      </footer>
    </div>
  );
}
