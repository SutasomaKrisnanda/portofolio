'use client';

import React, { useState, useEffect } from 'react';
import { ModeId, PORTFOLIO_MODES } from '@/data/portfolio-data';
import { useTheme } from '@/components/theme-provider';

interface FixedBackgroundProps {
  activeMode: ModeId;
  activeSectionIndex: number;
}

export const FixedBackground: React.FC<FixedBackgroundProps> = ({
  activeMode,
  activeSectionIndex
}) => {
  const currentMode = PORTFOLIO_MODES[activeMode];
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';
  const palette = isLight ? currentMode.palette.light : currentMode.palette.dark;

  // Dynamic ambient orbs configuration based on mode and section
  const orbShifts = [
    { top: '10%', left: '15%', opacity: isLight ? 0.22 : 0.35, scale: 1 },
    { top: '35%', left: '75%', opacity: isLight ? 0.2 : 0.3, scale: 1.15 },
    { top: '55%', left: '25%', opacity: isLight ? 0.22 : 0.32, scale: 1.1 },
    { top: '45%', left: '80%', opacity: isLight ? 0.18 : 0.28, scale: 1.05 },
    { top: '75%', left: '30%', opacity: isLight ? 0.24 : 0.35, scale: 1.2 },
    { top: '85%', left: '70%', opacity: isLight ? 0.26 : 0.38, scale: 1.25 }
  ];

  const currentShift = orbShifts[activeSectionIndex] || orbShifts[0];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-out overflow-hidden"
      style={{
        background: palette.pageGradient
      }}
    >
      {/* Primary Ambient Glow Orb */}
      <div
        className="absolute w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full blur-[140px] transition-all duration-1000 ease-out"
        style={{
          top: currentShift.top,
          left: currentShift.left,
          transform: `translate(-50%, -50%) scale(${currentShift.scale})`,
          background: `radial-gradient(circle, ${palette.accentHex} 0%, ${palette.glowColor} 45%, transparent 70%)`,
          opacity: currentShift.opacity
        }}
      />

      {/* Secondary Soft Counter-Glow Orb */}
      <div
        className="absolute w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full blur-[160px] transition-all duration-1000 ease-out"
        style={{
          bottom: activeSectionIndex % 2 === 0 ? '10%' : '20%',
          right: activeSectionIndex % 2 === 0 ? '15%' : '60%',
          background: `radial-gradient(circle, ${palette.accentSoftHex} 0%, transparent 65%)`,
          opacity: isLight ? 0.14 : 0.18
        }}
      />

      {/* Subtle Spatial Horizon Mesh Lines */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isLight ? 'opacity-15' : 'opacity-20'
        }`}
      >
        <circle
          cx="720"
          cy="450"
          r="500"
          fill="none"
          stroke={isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.18)'}
          strokeWidth="1"
        />
        <circle
          cx="720"
          cy="450"
          r="750"
          fill="none"
          stroke={isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.1)'}
          strokeWidth="0.8"
        />
        <path
          d="M 0,450 Q 720,380 1440,450"
          fill="none"
          stroke={palette.accentHex}
          strokeWidth="1.5"
          strokeOpacity={isLight ? '0.35' : '0.4'}
        />
      </svg>
    </div>
  );
};
