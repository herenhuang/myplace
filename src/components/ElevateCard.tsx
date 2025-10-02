'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ElevateCardProps {
  archetype: string;
  tagline: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Helper function to format archetype name for icon file
const formatArchetypeForIcon = (archetype: string): string => {
  return `icon_${archetype.toLowerCase().replace(/[\s-]/g, '_').replace(/^the_/, '')}`;
};

// Size presets for different contexts
const SIZE_PRESETS = {
  small: {
    width: 160,
    titleSize: 20,
    taglineSize: 11,
    iconSize: 100,
  },
  medium: {
    width: 200,
    titleSize: 28,
    taglineSize: 13,
    iconSize: 140,
  },
  large: {
    width: 280,
    titleSize: 40,
    taglineSize: 16,
    iconSize: 200,
  }
};

export default function ElevateCard({ 
  archetype, 
  tagline, 
  size = 'medium',
  className = ''
}: ElevateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dynamicFontSizes, setDynamicFontSizes] = useState(SIZE_PRESETS[size]);

  useEffect(() => {
    const updateFontSizes = () => {
      if (!cardRef.current) return;
      
      const cardWidth = cardRef.current.offsetWidth;
      const preset = SIZE_PRESETS[size];
      
      // Calculate scaling factor based on actual width vs preset width
      const scale = cardWidth / preset.width;
      
      setDynamicFontSizes({
        width: cardWidth,
        titleSize: Math.round(preset.titleSize * scale),
        taglineSize: Math.round(preset.taglineSize * scale),
        iconSize: Math.round(preset.iconSize * scale),
      });
    };

    // Initial calculation
    updateFontSizes();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(updateFontSizes);
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [size]);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg shadow-2xl overflow-hidden ${className}`}
      style={{
        width: size === 'small' ? '160px' : size === 'medium' ? '200px' : '280px',
        maxWidth: '80vw',
        aspectRatio: '4/5.5',
        backgroundImage: 'url(/elevate/card.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex flex-col justify-center items-center h-full p-4">
        <Image
          src={`/elevate/${formatArchetypeForIcon(archetype)}.png`}
          alt={`${archetype} icon`}
          width={dynamicFontSizes.iconSize}
          height={dynamicFontSizes.iconSize}
          className="rounded-lg mb-2"
          priority={size === 'large'}
        />
        <h1
          className="font-semibold leading-tight mb-1 text-center"
          style={{
            fontFamily: 'var(--font-instrument-serif)',
            color: 'rgb(130, 44, 44)',
            letterSpacing: '-0.1px',
            fontSize: `${dynamicFontSizes.titleSize}px`,
          }}
        >
          {archetype}
        </h1>
        <p
          className="font-medium leading-tight text-center"
          style={{
            fontFamily: 'var(--font-lora)',
            color: 'rgba(130, 44, 44, 0.6)',
            letterSpacing: '-0.025em',
            fontSize: `${dynamicFontSizes.taglineSize}px`,
            width: '80%',
          }}
        >
          {tagline}
        </p>
      </div>
    </div>
  );
}

