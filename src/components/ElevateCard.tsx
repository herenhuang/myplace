'use client';

import Image from 'next/image';

interface ElevateCardProps {
  archetype: string;
  tagline: string;
  dimension?: number; // Width dimension - height calculated from 4:5.5 ratio
  className?: string;
  imagePath?: string; // Base path for images (e.g., '/genshin' or '/elevate')
}

// Helper function to format archetype name for icon file
const formatArchetypeForIcon = (archetype: string): string => {
  return `icon_${archetype.toLowerCase().replace(/[\s-]/g, '_').replace(/^the_/, '')}`;
};

export default function ElevateCard({ 
  archetype, 
  tagline, 
  dimension = 200,
  className = '',
  imagePath = '/elevate' // Default to elevate for backwards compatibility
}: ElevateCardProps) {
  // Calculate height based on 4:5.5 aspect ratio
  const width = dimension;
  const height = Math.round(dimension * (5.5 / 4)); // 1.375 ratio
  
  // Calculate responsive sizes based on width
  const titleSize = Math.round(width * 0.115); // 11.5% of width (reduced from 14%)
  const taglineSize = Math.round(width * 0.055); // 5.5% of width (reduced from 6.5%)
  const iconSize = Math.round(width * 0.6); // 60% of width (reduced from 70%)
  const padding = Math.round(width * 0.08); // 8% of width

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        aspectRatio: '4 / 5.5',
        backgroundImage: imagePath === '/elevate'
          ? `url(/elevate/cardelevate.png)`
          : `url(${imagePath}/card2.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'drop-shadow(-12px 36px 36px rgba(0, 0, 0, .2))'
      }}
    >
      <div
        className="flex flex-col justify-center items-center h-full"
        style={{ padding: `${padding}px` }}
      >
        <h1
          className="font-semibold leading-tight text-center"
          style={{
            fontFamily: 'var(--font-instrument-serif)',
            color: 'rgb(130, 44, 44)',
            letterSpacing: '-0.1px',
            fontSize: `${titleSize}px`,
            marginBottom: `${padding * 0.25}px`,
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
            fontSize: `${taglineSize}px`,
            width: '80%',
          }}
        >
          {tagline}
        </p>
      </div>
    </div>
  );
}

