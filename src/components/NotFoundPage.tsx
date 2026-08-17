import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* 404 with Eye */}
        <div className="relative mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {/* First 4 */}
            <span className="text-[120px] md:text-[200px] lg:text-[240px] leading-none font-bold text-white">4</span>
            
            {/* Eye in 0 */}
            <div className="relative">
              <div className="w-[120px] h-[160px] md:w-[200px] md:h-[266px] lg:w-[240px] lg:h-[320px] border-[12px] md:border-[18px] lg:border-[20px] border-[#CCFF00] rounded-full flex items-center justify-center">
                {/* Outer eye circle */}
                <div className="relative w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-[#CCFF00] rounded-full flex items-center justify-center">
                  {/* Pupil */}
                  <div className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-black rounded-full flex items-center justify-center">
                    {/* Inner dot */}
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-[#CCFF00] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second 4 */}
            <span className="text-[120px] md:text-[200px] lg:text-[240px] leading-none font-bold text-white">4</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-wide mb-2">
          <span className="text-white">SORRY, THERE'S</span>
        </h1>
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-wide mb-12">
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
  );
}
