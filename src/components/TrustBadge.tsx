'use client';

import React from 'react';
import { TrustTier } from '@/types';
import { IntegrityService } from '@/services/integrityService';
import { Shield, ShieldCheck, Crown } from 'lucide-react';

interface TrustBadgeProps {
  tier: TrustTier;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function TrustBadge({
  tier,
  size = 'sm',
  showLabel = true,
  className = '',
}: TrustBadgeProps) {
  const info = IntegrityService.getTrustTierInfo(tier);

  const getIcon = () => {
    switch (tier) {
      case 'gold':
        return <Crown className={getIconSize()} />;
      case 'silver':
        return <ShieldCheck className={getIconSize()} />;
      case 'bronze':
      default:
        return <Shield className={getIconSize()} />;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-2.5 h-2.5';
      case 'sm':
        return 'w-3.5 h-3.5';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
    }
  };

  const getContainerStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-[9px] gap-1';
      case 'sm':
        return 'px-2 py-0.5 text-[10px] gap-1.5';
      case 'md':
        return 'px-2.5 py-1 text-xs gap-1.5';
      case 'lg':
        return 'px-3.5 py-1.5 text-sm gap-2';
    }
  };

  const getThemeStyles = () => {
    switch (tier) {
      case 'gold':
        return 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 dark:from-amber-950/60 dark:to-yellow-950/40 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/80 shadow-xs ring-1 ring-amber-400/30';
      case 'silver':
        return 'bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 dark:from-teal-950/60 dark:to-emerald-950/40 text-teal-900 dark:text-teal-300 border-teal-300/80 dark:border-teal-700/80 shadow-xs ring-1 ring-teal-400/30';
      case 'bronze':
      default:
        return 'bg-slate-100 dark:bg-[#1C2B27] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3E3A]';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border transition-all ${getContainerStyles()} ${getThemeStyles()} ${className}`}
      title={info.description}
    >
      <span className="shrink-0">{getIcon()}</span>
      {showLabel && <span>{info.shortLabel}</span>}
    </span>
  );
}
