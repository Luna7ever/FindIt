'use client';

import React from 'react';
import { ItemCategory } from '@/types';
import ItemIllustration from '@/components/ItemIllustration';

interface ItemVisualProps {
  category: ItemCategory;
  title?: string;
  imageUrl?: string;
  className?: string;
}

export default function ItemVisual({
  category,
  title = '',
  imageUrl,
  className = '',
}: ItemVisualProps) {
  // If a real uploaded image exists in future
  if (imageUrl && !imageUrl.includes('unsplash')) {
    return (
      <div className={`relative overflow-hidden bg-[#F1F3F0] ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  // Pure CSS-based visual illustration (No stock photos, no external assets)
  return (
    <ItemIllustration
      category={category}
      title={title}
      className={className}
    />
  );
}
