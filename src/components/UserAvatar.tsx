'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';
import { ShieldCheck } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  role?: UserRole;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export default function UserAvatar({
  name = 'مستخدم',
  role = 'student',
  avatarUrl,
  size = 'md',
  className = '',
  showBadge = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  }[size];

  // Extract initial
  const trimmedName = name.trim();
  const initial = trimmedName.startsWith('م.') 
    ? 'م' 
    : (trimmedName.charAt(0) || 'م');

  const isAdmin = role === 'admin';

  const hasValidCustomImage = avatarUrl && 
    !avatarUrl.includes('dicebear.com') && 
    !imageError && 
    (avatarUrl.startsWith('data:') || avatarUrl.startsWith('/'));

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {hasValidCustomImage ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-[#E4E7E4] dark:ring-[#263834] ${className}`}
        />
      ) : (
        <div
          aria-label={name}
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold select-none transition-all ${
            isAdmin
              ? 'bg-gradient-to-br from-[#176B5B] to-[#0F4A3E] dark:from-[#2DD4BF] dark:to-emerald-800 text-white dark:text-slate-950 shadow-2xs ring-1 ring-[#176B5B]/30'
              : 'bg-gradient-to-br from-[#E6F1ED] to-[#D5EAE2] dark:from-[#122823] dark:to-[#173830] text-[#176B5B] dark:text-[#2DD4BF] ring-1 ring-[#BCE1D4] dark:ring-[#1E463D]'
          } ${className}`}
        >
          <span>{initial}</span>
        </div>
      )}

      {showBadge && isAdmin && (
        <span
          title="إدارة المدرسة"
          className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-[#176B5B] dark:bg-[#2DD4BF] text-white dark:text-slate-950 flex items-center justify-center ring-1 ring-white dark:ring-[#141C1A]"
        >
          <ShieldCheck className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}
