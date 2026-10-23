'use client';

import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakKidsText } from '@/lib/kidsVoice';

interface AudioVoiceButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AudioVoiceButton({
  text,
  size = 'md',
  className = '',
}: AudioVoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPlaying(true);
    speakKidsText(text);
    setTimeout(() => setIsPlaying(false), 2400);
  };

  const sizeClasses = {
    sm: 'w-6 h-6 min-w-[24px] min-h-[24px]',
    md: 'w-7 h-7 sm:w-8 sm:h-8 min-w-[28px] min-h-[28px]',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px]',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`inline-flex items-center justify-center rounded-full bg-[#E3E8D8] hover:bg-[#D5DEC8] text-[#2D3F37] border border-[#CCD7BE] transition-all active:scale-90 shadow-2xs cursor-pointer shrink-0 select-none ${
        isPlaying ? 'ring-2 ring-emerald-500 animate-pulse scale-105 bg-emerald-200' : ''
      } ${sizeClasses} ${className}`}
      title="استمع للصوت 🔊"
      aria-label={`استمع لنص: ${text}`}
    >
      <Volume2 className={iconSizes} />
    </button>
  );
}
